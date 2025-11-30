// Simplified security middleware
import crypto from 'crypto'
import AuditLog from '../models/AuditLog.js'

// Security validation middleware
export const securityValidation = (req, res, next) => {
  try {
    // Basic request validation
    const validation = {
      isValid: true,
      issues: []
    }
    
    // Check for basic security threats
    if (req.body && typeof req.body === 'object') {
      const bodyStr = JSON.stringify(req.body)
      if (bodyStr.includes('<script>') || bodyStr.includes('javascript:')) {
        validation.isValid = false
        validation.issues.push('Potential XSS attack detected')
      }
    }
    
    if (!validation.isValid) {
      // Log security threat
      logSecurityEvent('SECURITY_THREAT_DETECTED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        issues: validation.issues,
        path: req.path,
        method: req.method
      })
      
      return res.status(400).json({
        success: false,
        message: 'Security validation failed',
        issues: validation.issues
      })
    }
    
    next()
  } catch (error) {
    console.error('Security validation error:', error)
    next()
  }
}

// IP filtering middleware (simplified)
export const ipFiltering = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress
  
  // Basic IP validation - allow all for now
  // In production, you would implement proper IP whitelist/blacklist logic
  next()
}

// Brute force protection middleware
export const bruteForceProtection = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress
  
  // Basic brute force protection - allow all for now
  // In production, you would implement proper rate limiting logic
    next()
}

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  next()
}

// Request ID middleware
export const requestId = (req, res, next) => {
  req.requestId = crypto.randomUUID()
  res.setHeader('X-Request-ID', req.requestId)
  next()
}

// Suspicious activity detection middleware
export const suspiciousActivityDetection = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress
  
  // Basic suspicious activity detection
  const suspiciousPatterns = [
    /\.\.\//g,  // Directory traversal
    /<script/gi,  // XSS attempts
    /union\s+select/gi,  // SQL injection
    /javascript:/gi  // JavaScript injection
  ]
  
  const requestString = JSON.stringify({
    path: req.path,
    query: req.query,
    body: req.body
  })
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY_DETECTED', {
        ip: clientIP,
        pattern: pattern.toString(),
        path: req.path,
        method: req.method
      })
      break
    }
  }
  
  next()
}

// Data sanitization middleware
export const dataSanitization = (req, res, next) => {
  // Basic data sanitization
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body)
  }
  
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query)
  }
  
  next()
}

// Helper function to sanitize objects
function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potential XSS and injection attempts
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key])
    }
  }
}

// Helper function to log security events
async function logSecurityEvent(eventType, data) {
  try {
    const auditLog = new AuditLog({
      eventType,
      ip: data.ip,
      userAgent: data.userAgent,
      details: data,
      timestamp: new Date()
    })
    
    await auditLog.save()
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

// Rate limiting middleware (simplified)
export const rateLimiter = (req, res, next) => {
  // Basic rate limiting - allow all for now
  // In production, you would implement proper rate limiting logic
  next()
}