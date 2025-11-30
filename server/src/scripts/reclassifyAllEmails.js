/**
 * Standalone script to reclassify all emails using rule-based classification
 * Preserves manually categorized emails and shows progress
 * 
 * Usage: node server/src/scripts/reclassifyAllEmails.js [userId]
 *   - No userId: Reclassify all emails for all users
 *   - With userId: Reclassify emails for specific user only
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { reclassifyAllEmailsWithRuleBased } from '../services/emailReclassificationService.js'
import User from '../models/User.js'

// Load environment variables - look in multiple possible locations
dotenv.config({ path: '../.env' })
dotenv.config({ path: './.env' })
dotenv.config({ path: '../../.env' })

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sortify'
    console.log('📊 Connecting to MongoDB...')
    console.log('📍 MongoDB URI:', mongoUri ? `${mongoUri.substring(0, 20)}...` : 'NOT SET')
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    console.log('✅ Connected to MongoDB successfully')
    console.log(`   Host: ${mongoose.connection.host}`)
    console.log(`   Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('   Make sure MONGO_URI is set in your .env file')
    console.error('   Or ensure MongoDB is running at mongodb://localhost:27017/sortify')
    process.exit(1)
  }
}

/**
 * Format time duration
 */
const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

/**
 * Print statistics in a formatted way
 */
const printStatistics = (stats) => {
  console.log('\n' + '='.repeat(60))
  console.log('📊 RECLASSIFICATION STATISTICS')
  console.log('='.repeat(60))
  
  console.log(`\n👥 Users Processed: ${stats.totalUsers}`)
  console.log(`📧 Total Emails: ${stats.totalEmails}`)
  console.log(`✅ Processed: ${stats.processedEmails}`)
  console.log(`🔄 Reclassified: ${stats.reclassifiedEmails}`)
  console.log(`⏭️  Skipped (Manual): ${stats.skippedManualEmails}`)
  console.log(`⏭️  Skipped (Same Category): ${stats.skippedSameCategory}`)
  console.log(`❌ Errors: ${stats.errorCount}`)
  
  // Category changes breakdown
  if (Object.keys(stats.categoryChanges).length > 0) {
    console.log('\n📋 Category Changes:')
    Object.keys(stats.categoryChanges).forEach(oldCat => {
      Object.keys(stats.categoryChanges[oldCat]).forEach(newCat => {
        const count = stats.categoryChanges[oldCat][newCat]
        console.log(`   ${oldCat} → ${newCat}: ${count} emails`)
      })
    })
  }
  
  // Per-user results
  if (stats.userResults && stats.userResults.length > 0) {
    console.log('\n👤 Per-User Results:')
    stats.userResults.forEach(userResult => {
      console.log(`\n   ${userResult.userEmail}:`)
      console.log(`      Total: ${userResult.totalEmails}`)
      console.log(`      Reclassified: ${userResult.reclassifiedEmails}`)
      console.log(`      Skipped (Manual): ${userResult.skippedManualEmails}`)
      console.log(`      Skipped (Same): ${userResult.skippedSameCategory}`)
    })
  }
  
  console.log('\n' + '='.repeat(60))
}

/**
 * Main execution
 */
const main = async () => {
  try {
    const startTime = Date.now()
    
    // Connect to database FIRST before any queries
    await connectDB()
    
    // Get userId from command line arguments
    const userId = process.argv[2] || null
    
    console.log('\n🚀 Starting Rule-Based Email Reclassification')
    console.log('='.repeat(60))
    
    if (userId) {
      console.log(`📌 Target User: ${userId}`)
      // Validate user exists
      const user = await User.findById(userId)
      if (!user) {
        console.error(`❌ User with ID ${userId} not found`)
        await mongoose.connection.close()
        process.exit(1)
      }
      console.log(`✅ User found: ${user.email}`)
    } else {
      console.log('📌 Target: All Users')
      const userCount = await User.countDocuments({})
      console.log(`✅ Found ${userCount} user(s)`)
    }
    
    console.log('\n⚙️  Configuration:')
    console.log('   - Preserve Manual Categorizations: Yes')
    console.log('   - Batch Size: 100 emails')
    console.log('   - Classification: Rule-Based (Label + Keyword)')
    
    console.log('\n🔄 Starting reclassification...\n')
    
    // Run reclassification
    const result = await reclassifyAllEmailsWithRuleBased(userId, {
      preserveManual: true,
      batchSize: 100
    })
    
    if (!result.success) {
      console.error('\n❌ Reclassification failed:', result.message)
      process.exit(1)
    }
    
    // Calculate duration
    const duration = Math.floor((Date.now() - startTime) / 1000)
    
    // Print statistics
    printStatistics(result.statistics)
    
    console.log(`\n⏱️  Total Duration: ${formatDuration(duration)}`)
    console.log(`✅ Reclassification completed successfully!`)
    console.log('\n')
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    // Close database connection
    await mongoose.connection.close()
    console.log('📊 Database connection closed')
    process.exit(0)
  }
}

// Run the script
main()

