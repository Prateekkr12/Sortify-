// Unified rule-based email classification service
// Combines label-based and keyword-based classification with priority order

import { matchLabelsToCategory } from './labelClassificationService.js'
import { classifyWithKeywords } from './keywordClassificationService.js'
import { CLASSIFICATION_CONFIG } from '../config/classification.js'

/**
 * Main rule-based email classification function
 * Priority order: Label-based > Sender patterns > Keyword-based > Fallback
 * 
 * @param {Object} emailData - Email data
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.from - Email sender
 * @param {string} emailData.snippet - Email snippet
 * @param {string} emailData.body - Email body
 * @param {Array<string>} emailData.labels - Gmail labels array
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Classification result
 */
export const classifyEmail = async (emailData, userId) => {
  try {
    const { subject = '', from = '', snippet = '', body = '', labels = [] } = emailData
    
    if (!userId) {
      console.log('⚠️ No userId provided for classification')
      return {
        label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
        confidence: CLASSIFICATION_CONFIG.ruleBased.defaultConfidence,
        method: 'rule-based-no-user'
      }
    }
    
    console.log(`🔍 Rule-based classification: "${subject}"`)
    
    // Priority 1: Label-based classification (highest confidence)
    if (labels && labels.length > 0) {
      const labelMatch = await matchLabelsToCategory(labels, userId)
      if (labelMatch) {
        console.log(`✅ Label match: "${subject}" → ${labelMatch.label} (${labelMatch.confidence})`)
        return {
          label: labelMatch.label,
          confidence: labelMatch.confidence,
          method: labelMatch.method,
          matchedLabel: labelMatch.matchedLabel,
          mappingId: labelMatch.mappingId,
          phase: 1,
          model: 'rule-based-label'
        }
      }
    }
    
    // Priority 2: Keyword-based classification (includes sender patterns)
    const keywordResult = await classifyWithKeywords(
      { subject, from, snippet, body },
      userId
    )
    
    // Check if keyword classification found a good match
    if (keywordResult && keywordResult.confidence >= CLASSIFICATION_CONFIG.ruleBased.keywordMinimumConfidence) {
      console.log(`✅ Keyword match: "${subject}" → ${keywordResult.label} (${keywordResult.confidence}) via ${keywordResult.method}`)
      
      // If sender pattern matched, it's very reliable
      if (keywordResult.method && (
        keywordResult.method.includes('sender-') ||
        keywordResult.method.includes('sender-domain') ||
        keywordResult.method.includes('sender-name') ||
        keywordResult.method.includes('specific-sender')
      )) {
        // Sender matches are highly reliable - use them
        return {
          label: keywordResult.label,
          confidence: keywordResult.confidence,
          method: keywordResult.method,
          matchedKeywords: keywordResult.matchedKeywords,
          matchedPhrases: keywordResult.matchedPhrases,
          matchedPattern: keywordResult.matchedPattern,
          matchedValue: keywordResult.matchedValue,
          phase: 1,
          model: 'rule-based-sender'
        }
      }
      
      // Keyword/phrase matches with good confidence
      if (keywordResult.confidence >= CLASSIFICATION_CONFIG.ruleBased.keywordOptimalConfidence) {
        return {
          label: keywordResult.label,
          confidence: keywordResult.confidence,
          method: keywordResult.method,
          matchedKeywords: keywordResult.matchedKeywords,
          matchedPhrases: keywordResult.matchedPhrases,
          keywordScore: keywordResult.keywordScore,
          phase: 1,
          model: 'rule-based-keyword'
        }
      }
      
      // Lower confidence keyword match - still acceptable but log it
      if (keywordResult.confidence >= CLASSIFICATION_CONFIG.ruleBased.keywordMinimumConfidence) {
        console.log(`⚠️ Lower confidence keyword match: ${keywordResult.confidence}`)
        return {
          label: keywordResult.label,
          confidence: keywordResult.confidence,
          method: keywordResult.method,
          matchedKeywords: keywordResult.matchedKeywords,
          matchedPhrases: keywordResult.matchedPhrases,
          keywordScore: keywordResult.keywordScore,
          phase: 1,
          model: 'rule-based-keyword-low-confidence'
        }
      }
    }
    
    // Priority 3: Fallback to "Other" category
    console.log(`⚠️ No match found: "${subject}" → ${CLASSIFICATION_CONFIG.ruleBased.fallbackCategory}`)
    return {
      label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
      confidence: CLASSIFICATION_CONFIG.ruleBased.defaultConfidence,
      method: 'rule-based-fallback',
      phase: 1,
      model: 'rule-based'
    }
    
  } catch (error) {
    console.error('❌ Rule-based classification error:', error)
    return {
      label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
      confidence: CLASSIFICATION_CONFIG.ruleBased.defaultConfidence,
      method: 'rule-based-error',
      phase: 1,
      model: 'rule-based',
      error: error.message
    }
  }
}

/**
 * Classify email with backward-compatible signature
 * @param {string} subject - Email subject
 * @param {string} snippet - Email snippet
 * @param {string} body - Email body
 * @param {string} userId - User ID
 * @param {Object} emailData - Additional email data (optional)
 * @returns {Promise<Object>} - Classification result
 */
export const classifyEmailCompat = async (subject, snippet, body, userId = null, emailData = {}) => {
  const fullEmailData = {
    subject,
    snippet,
    body,
    from: emailData.from || '',
    labels: emailData.labels || []
  }
  
  return await classifyEmail(fullEmailData, userId)
}

/**
 * Batch classification of multiple emails
 * @param {Array<Object>} emails - Array of email objects
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of classification results
 */
export const classifyEmails = async (emails, userId) => {
  try {
    const classificationPromises = emails.map(email => {
      const emailData = {
        subject: email.subject || '',
        from: email.from || '',
        snippet: email.snippet || '',
        body: email.body || email.text || '',
        labels: email.labels || []
      }
      return classifyEmail(emailData, userId)
    })
    
    const results = await Promise.all(classificationPromises)
    
    return results.map((classification, index) => ({
      ...emails[index],
      category: classification.label,
      classification: {
        label: classification.label,
        confidence: classification.confidence,
        method: classification.method,
        model: classification.model || 'rule-based',
        phase: classification.phase || 1,
        matchedKeywords: classification.matchedKeywords,
        matchedPhrases: classification.matchedPhrases,
        classifiedAt: new Date()
      }
    }))
    
  } catch (error) {
    console.error('❌ Batch classification error:', error)
    // Return emails with fallback classification
    return emails.map(email => ({
      ...email,
      category: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
      classification: {
        label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
        confidence: CLASSIFICATION_CONFIG.ruleBased.defaultConfidence,
        method: 'rule-based-batch-error',
        model: 'rule-based',
        error: error.message
      }
    }))
  }
}

export default {
  classifyEmail,
  classifyEmailCompat,
  classifyEmails
}

