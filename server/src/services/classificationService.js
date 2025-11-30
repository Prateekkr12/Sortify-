// Enhanced email classification service
// Now uses rule-based classification (label + keyword) instead of ML models

import { classifyEmail as ruleBasedClassify, classifyEmails as ruleBasedClassifyEmails } from './ruleBasedClassificationService.js'
import notificationService from './notificationService.js'

// Main classification function - uses rule-based service
export const classifyEmail = async (subject, snippet, body, userId = null, emailData = {}) => {
  try {
    // Use rule-based classification
    const result = await ruleBasedClassify({
      subject,
      snippet,
      body,
      from: emailData.from || '',
      labels: emailData.labels || []
    }, userId)
    
    // Send notification if user ID is provided
    if (userId && result.label) {
      try {
        notificationService.sendClassificationNotification(userId, {
          emailId: emailData.emailId || 'temp',
          category: result.label,
          confidence: result.confidence
        })
      } catch (notifError) {
        // Don't fail classification if notification fails
        console.warn('Failed to send classification notification:', notifError.message)
      }
    }
    
    return {
      label: result.label,
      confidence: result.confidence,
      method: result.method,
      model: result.model || 'rule-based',
      phase: result.phase || 1
    }
  } catch (error) {
    console.error('❌ Classification error:', error)
    // Final fallback
    return {
      label: 'Other',
      confidence: 0.3,
      model: 'error-fallback'
    }
  }
}

export const classifyEmails = async (emails, userId = null) => {
  try {
    // Use rule-based batch classification
    return await ruleBasedClassifyEmails(emails, userId)
  } catch (error) {
    console.error('❌ Batch classification error:', error)
    
    // Fallback to individual classification
    const classifiedEmails = await Promise.all(emails.map(async email => {
      const classification = await classifyEmail(
        email.subject, 
        email.snippet, 
        email.body || email.text, 
        userId,
        email
      )
      return {
        ...email,
        category: classification.label,
        classification: {
          label: classification.label,
          confidence: classification.confidence,
          model: classification.model || 'individual-fallback'
        }
      }
    }))
    
    return classifiedEmails
  }
}

/**
 * Get service health status (exported for compatibility)
 */
export const getMLServiceHealth = async () => {
  // Rule-based service is always available (no external service)
  return {
    isHealthy: true,
    lastCheck: Date.now(),
    serviceUrl: 'rule-based-local'
  }
}
