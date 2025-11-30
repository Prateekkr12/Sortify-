/**
 * Comprehensive Feature Test Script
 * Tests all major features of the Sortify application
 * 
 * Usage: node server/src/scripts/testFeatures.js
 * 
 * Requires:
 * - Server running on PORT 5000 (or PORT env var)
 * - Valid user credentials in .env or test credentials
 */

import dotenv from 'dotenv'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from project root (go up from server/src/scripts to project root)
dotenv.config({ path: join(__dirname, '../../../.env') })

const BASE_URL = process.env.API_URL || 'http://localhost:5000'
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword'

let authToken = null
let userId = null
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
}

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(testName, passed, error = null) {
  if (passed) {
    log(`✓ ${testName}`, 'green')
    testResults.passed++
  } else {
    log(`✗ ${testName}`, 'red')
    testResults.failed++
    if (error) {
      log(`  Error: ${error}`, 'red')
      testResults.errors.push({ test: testName, error })
    }
  }
}

async function apiRequest(endpoint, options = {}) {
  try {
    const config = {
      method: options.method || 'GET',
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`
    }

    if (options.body) {
      config.data = options.body
    }

    const response = await axios(config)
    
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data || {}
    }
  } catch (error) {
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      return {
        ok: false,
        status: error.response.status,
        data: error.response.data || {},
        error: error.response.data?.message || `HTTP ${error.response.status}`
      }
    } else if (error.request) {
      // Request made but no response
      return {
        ok: false,
        status: 0,
        error: `Cannot connect to server at ${BASE_URL}. Is the server running?`,
        data: { message: 'Server connection failed' }
      }
    } else {
      // Error setting up request
      return {
        ok: false,
        status: 0,
        error: error.message,
        data: {}
      }
    }
  }
}

async function testAuthentication() {
  log('\n🔐 Testing Authentication...', 'cyan')
  
  // First try to register a test user (in case it doesn't exist)
  const registerResponse = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  })

  if (registerResponse.ok && registerResponse.data.token) {
    log('✓ Test user registered successfully', 'green')
    authToken = registerResponse.data.token
    userId = registerResponse.data.user?.id || registerResponse.data.userId
    logTest('Register Test User', true)
    log(`  Token set: ${authToken ? 'Yes' : 'No'}`, 'blue')
    return true
  } else if (registerResponse.data.message?.includes('already exists')) {
    log('⚠️  Test user already exists, attempting login...', 'yellow')
    // User exists, try to login
  } else {
    log(`⚠️  Registration failed: ${registerResponse.data.message}`, 'yellow')
    log('⚠️  Attempting login with existing credentials...', 'yellow')
  }
  
  // Test login
  const loginResponse = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  })

  if (loginResponse.ok && loginResponse.data.token) {
    authToken = loginResponse.data.token
    userId = loginResponse.data.user?.id || loginResponse.data.userId
    logTest('Login', true)
    log(`  Token set: ${authToken ? 'Yes' : 'No'}`, 'blue')
    return true
  } else {
    logTest('Login', false, loginResponse.data.message || loginResponse.error)
    return false
  }
}

async function testNotifications() {
  log('\n🔔 Testing Notifications...', 'cyan')
  
  // Test get notifications
  const getResponse = await apiRequest('/api/notifications')
  logTest('Get Notifications', getResponse.ok, getResponse.data.message)
  
  // Test notification stats
  const statsResponse = await apiRequest('/api/notifications/stats')
  logTest('Notification Stats', statsResponse.ok, statsResponse.data.message)
  
  // Test send test notification
  const testResponse = await apiRequest('/api/notifications/test', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Test Notification',
      message: 'This is a test notification'
    })
  })
  logTest('Send Test Notification', testResponse.ok, testResponse.data.message)
  
  return getResponse.ok
}

async function testPerformance() {
  log('\n⚡ Testing Performance Endpoints...', 'cyan')
  
  // Test performance metrics
  const metricsResponse = await apiRequest('/api/performance/metrics')
  logTest('Performance Metrics', metricsResponse.ok, metricsResponse.data.message)
  
  // Test health check
  const healthResponse = await apiRequest('/api/performance/health')
  logTest('System Health', healthResponse.ok, healthResponse.data.message)
  
  // Test analytics performance
  const analyticsPerfResponse = await apiRequest('/api/analytics/performance')
  logTest('Analytics Performance', analyticsPerfResponse.ok, analyticsPerfResponse.data.message)
  
  return metricsResponse.ok && healthResponse.ok
}

async function testEmailOperations() {
  log('\n📧 Testing Email Operations...', 'cyan')
  
  // Get emails list first
  const emailsResponse = await apiRequest('/api/emails?limit=5')
  logTest('Get Emails List', emailsResponse.ok, emailsResponse.data.message)
  
  if (!emailsResponse.ok || !emailsResponse.data.items || emailsResponse.data.items.length === 0) {
    log('⚠️  No emails found to test operations on', 'yellow')
    return false
  }
  
  const testEmail = emailsResponse.data.items[0]
  const emailId = testEmail._id || testEmail.id
  
  log(`  Using email: ${testEmail.subject} (${emailId})`, 'blue')
  
  // Test archive
  const archiveResponse = await apiRequest(`/api/emails/${emailId}/archive`, {
    method: 'PUT'
  })
  logTest('Archive Email', archiveResponse.ok, archiveResponse.data.message)
  
  // Test unarchive
  const unarchiveResponse = await apiRequest(`/api/emails/${emailId}/unarchive`, {
    method: 'PUT'
  })
  logTest('Unarchive Email', unarchiveResponse.ok, unarchiveResponse.data.message)
  
  // Test mark as read (using bulk operations)
  const readResponse = await apiRequest('/api/emails/bulk', {
    method: 'POST',
    body: JSON.stringify({
      operation: 'markRead',
      emailIds: [emailId]
    })
  })
  logTest('Mark Email as Read', readResponse.ok, readResponse.data.message)
  
  // Test reply (if Gmail connected)
  if (testEmail.gmailId) {
    const replyResponse = await apiRequest(`/api/emails/${emailId}/reply`, {
      method: 'POST',
      body: JSON.stringify({
        body: 'Test reply from automated test script'
      })
    })
    // Reply might fail if Gmail not connected, so we don't fail the test
    if (replyResponse.ok) {
      logTest('Send Reply', true)
    } else {
      log(`  ⚠️  Reply skipped: ${replyResponse.data.message || 'Gmail may not be connected'}`, 'yellow')
    }
  }
  
  return true
}

async function testAnalytics() {
  log('\n📊 Testing Analytics...', 'cyan')
  
  // Test category counts
  const categoriesResponse = await apiRequest('/api/analytics/categories')
  logTest('Category Counts', categoriesResponse.ok, categoriesResponse.data.message)
  
  // Test accuracy
  const accuracyResponse = await apiRequest('/api/analytics/accuracy')
  logTest('Classification Accuracy', accuracyResponse.ok, accuracyResponse.data.message)
  
  // Test stats
  const statsResponse = await apiRequest('/api/analytics/stats')
  logTest('Email Statistics', statsResponse.ok, statsResponse.data.message)
  
  // Test performance
  const perfResponse = await apiRequest('/api/analytics/performance')
  logTest('Analytics Performance', perfResponse.ok, perfResponse.data.message)
  
  return categoriesResponse.ok && accuracyResponse.ok && statsResponse.ok
}

async function testCategories() {
  log('\n📁 Testing Categories...', 'cyan')
  
  // Get categories - the endpoint is /api/realtime/categories based on server.js routing
  const getResponse = await apiRequest('/api/realtime/categories')
  logTest('Get Categories', getResponse.ok, getResponse.data.message || getResponse.error)
  
  return getResponse.ok
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'bright')
  log('🧪 Sortify Feature Test Suite', 'bright')
  log('='.repeat(60), 'bright')
  
  // Test authentication first
  const authSuccess = await testAuthentication()
  if (!authSuccess) {
    log('\n❌ Authentication failed. Cannot continue tests.', 'red')
    log('Please check TEST_EMAIL and TEST_PASSWORD in .env file', 'yellow')
    process.exit(1)
  }
  
  // Run all tests
  await testNotifications()
  await testPerformance()
  await testEmailOperations()
  await testAnalytics()
  await testCategories()
  
  // Print summary
  log('\n' + '='.repeat(60), 'bright')
  log('📊 Test Summary', 'bright')
  log('='.repeat(60), 'bright')
  log(`Total Tests: ${testResults.passed + testResults.failed}`, 'cyan')
  log(`Passed: ${testResults.passed}`, 'green')
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green')
  
  if (testResults.errors.length > 0) {
    log('\n❌ Failed Tests:', 'red')
    testResults.errors.forEach(({ test, error }) => {
      log(`  - ${test}: ${error}`, 'red')
    })
  }
  
  log('\n' + '='.repeat(60), 'bright')
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})

