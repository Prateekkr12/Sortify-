// Enhanced keyword-based email classification service
// Uses multi-tier scoring with subject/snippet/body weights and phrase matching

import KEYWORD_CATEGORIES, { CATEGORY_WEIGHTS, CONTENT_WEIGHTS } from '../config/keywordCategories.js'
import Category from '../models/Category.js'
import {
  extractSenderDomain,
  extractSenderName,
  matchesDomainPattern,
  matchesNamePattern,
  matchSpecificSender,
  countKeywordMatches,
  matchPhrases
} from '../utils/senderPatternMatcher.js'
import { CLASSIFICATION_CONFIG } from '../config/classification.js'

// Cache for user categories
const categoryCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get categories for user from cache or database
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - User categories
 */
const getCategoriesForUser = async (userId) => {
  const cacheKey = `categories_${userId}`
  const cached = categoryCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  const categories = await Category.find({ 
    userId, 
    isActive: true 
  }).select('name keywords patterns classificationStrategy priority').lean()
  
  categoryCache.set(cacheKey, {
    data: categories,
    timestamp: Date.now()
  })
  
  return categories
}

/**
 * Match keywords in different email parts with weighted scoring
 * @param {string} subject - Email subject
 * @param {string} snippet - Email snippet
 * @param {string} body - Email body
 * @param {Object} categoryConfig - Category keyword configuration
 * @returns {Object} - Match results with scores
 */
const matchKeywordsWithWeights = (subject, snippet, body, categoryConfig) => {
  const allText = `${subject || ''} ${snippet || ''} ${body || ''}`.toLowerCase()
  const subjectLower = (subject || '').toLowerCase()
  const snippetLower = (snippet || '').toLowerCase()
  const bodyLower = (body || '').toLowerCase()
  
  let totalScore = 0
  const matchedKeywords = []
  const matchedPhrasesList = []
  
  // Match primary keywords
  if (categoryConfig.primaryKeywords && categoryConfig.primaryKeywords.length > 0) {
    for (const keyword of categoryConfig.primaryKeywords) {
      const keywordLower = keyword.toLowerCase()
      let keywordScore = 0
      let matched = false
      
      // Check subject (highest weight)
      if (subjectLower.includes(keywordLower)) {
        const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        const matches = subjectLower.match(regex)
        if (matches) {
          keywordScore += matches.length * CONTENT_WEIGHTS.primaryKeyword * CONTENT_WEIGHTS.subject
          matched = true
        }
      }
      
      // Check snippet (medium weight)
      if (snippetLower.includes(keywordLower)) {
        const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        const matches = snippetLower.match(regex)
        if (matches) {
          keywordScore += matches.length * CONTENT_WEIGHTS.primaryKeyword * CONTENT_WEIGHTS.snippet
          matched = true
        }
      }
      
      // Check body (lower weight)
      if (bodyLower.includes(keywordLower)) {
        const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        const matches = bodyLower.match(regex)
        if (matches) {
          keywordScore += matches.length * CONTENT_WEIGHTS.primaryKeyword * CONTENT_WEIGHTS.body
          matched = true
        }
      }
      
      if (matched) {
        matchedKeywords.push(keyword)
        totalScore += keywordScore
      }
    }
  }
  
  // Match secondary keywords
  if (categoryConfig.secondaryKeywords && categoryConfig.secondaryKeywords.length > 0) {
    for (const keyword of categoryConfig.secondaryKeywords) {
      const keywordLower = keyword.toLowerCase()
      let keywordScore = 0
      let matched = false
      
      if (subjectLower.includes(keywordLower)) {
        const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        const matches = subjectLower.match(regex)
        if (matches) {
          keywordScore += matches.length * CONTENT_WEIGHTS.secondaryKeyword * CONTENT_WEIGHTS.subject
          matched = true
        }
      }
      
      if (snippetLower.includes(keywordLower)) {
        const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        const matches = snippetLower.match(regex)
        if (matches) {
          keywordScore += matches.length * CONTENT_WEIGHTS.secondaryKeyword * CONTENT_WEIGHTS.snippet
          matched = true
        }
      }
      
      if (bodyLower.includes(keywordLower)) {
        const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        const matches = bodyLower.match(regex)
        if (matches) {
          keywordScore += matches.length * CONTENT_WEIGHTS.secondaryKeyword * CONTENT_WEIGHTS.body
          matched = true
        }
      }
      
      if (matched) {
        matchedKeywords.push(keyword)
        totalScore += keywordScore
      }
    }
  }
  
  // Match phrases (higher confidence)
  if (categoryConfig.phrases && categoryConfig.phrases.length > 0) {
    const phraseResults = matchPhrases(allText, categoryConfig.phrases)
    if (phraseResults.count > 0) {
      matchedPhrasesList.push(...phraseResults.matchedPhrases)
      totalScore += phraseResults.score * CONTENT_WEIGHTS.phrase
    }
  }
  
  return {
    score: totalScore,
    matchedKeywords,
    matchedPhrases: matchedPhrasesList,
    matchCount: matchedKeywords.length + matchedPhrasesList.length
  }
}

/**
 * Check if email should be excluded from this category
 * @param {string} from - Email sender
 * @param {string} subject - Email subject
 * @param {string} snippet - Email snippet
 * @param {Object} categoryConfig - Category configuration
 * @returns {boolean} - True if should be excluded
 */
const shouldExcludeFromCategory = (from, subject, snippet, categoryConfig) => {
  if (!categoryConfig) return false
  
  const allText = `${from || ''} ${subject || ''} ${snippet || ''}`.toLowerCase()
  
  // Check exclusion keywords
  if (categoryConfig.exclusionKeywords && categoryConfig.exclusionKeywords.length > 0) {
    for (const exclusionKeyword of categoryConfig.exclusionKeywords) {
      if (allText.includes(exclusionKeyword.toLowerCase())) {
        return true
      }
    }
  }
  
  // Check exclusion domains (exact or substring match)
  if (categoryConfig.patterns && categoryConfig.patterns.excludeDomains) {
    const domain = extractSenderDomain(from)
    if (domain) {
      const lowerDomain = domain.toLowerCase()
      for (const excludeDomain of categoryConfig.patterns.excludeDomains) {
        const lowerExclude = excludeDomain.toLowerCase()
        // Check for exact match or substring match (e.g., "email.openai.com" contains "openai.com")
        if (lowerDomain === lowerExclude || lowerDomain.includes(lowerExclude)) {
          console.log(`⛔ Domain exclusion match: ${domain} excludes ${excludeDomain}`)
          return true
        }
      }
    }
  }
  
  // Check exclusion names (exact or substring match)
  if (categoryConfig.patterns && categoryConfig.patterns.excludeNames) {
    const name = extractSenderName(from)
    if (name) {
      const lowerName = name.toLowerCase()
      for (const excludeName of categoryConfig.patterns.excludeNames) {
        const lowerExclude = excludeName.toLowerCase()
        // Check for exact match or substring match
        if (lowerName === lowerExclude || lowerName.includes(lowerExclude)) {
          console.log(`⛔ Name exclusion match: ${name} excludes ${excludeName}`)
          return true
        }
      }
    }
  }
  
  return false
}

/**
 * Check sender domain/name patterns
 * @param {string} from - Email sender
 * @param {Object} category - Category with patterns
 * @returns {Object|null} - Match result or null
 */
const matchSenderPatterns = (from, category) => {
  if (!from || !category) return null
  
  // Check specific sender patterns first (high confidence)
  const specificMatch = matchSpecificSender(from, category.name)
  if (specificMatch && specificMatch.matched) {
    return {
      category: category.name,
      confidence: specificMatch.confidence,
      method: 'specific-sender',
      matchedPattern: specificMatch.pattern,
      matchedValue: from
    }
  }
  
  // Check domain patterns
  if (category.patterns && category.patterns.senderDomains) {
    const domain = extractSenderDomain(from)
    if (domain) {
      for (const pattern of category.patterns.senderDomains) {
        if (matchesDomainPattern(domain, pattern)) {
          return {
            category: category.name,
            confidence: CLASSIFICATION_CONFIG.ruleBased.senderDomainConfidence,
            method: 'sender-domain',
            matchedPattern: pattern,
            matchedValue: domain
          }
        }
      }
    }
  }
  
  // Check name patterns
  if (category.patterns && category.patterns.senderNames) {
    const name = extractSenderName(from)
    if (name) {
      for (const pattern of category.patterns.senderNames) {
        if (matchesNamePattern(name, pattern)) {
          return {
            category: category.name,
            confidence: CLASSIFICATION_CONFIG.ruleBased.senderNameConfidence,
            method: 'sender-name',
            matchedPattern: pattern,
            matchedValue: name
          }
        }
      }
    }
  }
  
  return null
}

/**
 * Enhanced keyword-based classification with multi-tier scoring
 * @param {Object} email - Email data {subject, from, snippet, body}
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Classification result
 */
export const classifyWithKeywords = async (email, userId) => {
  try {
    const { subject = '', from = '', snippet = '', body = '' } = email
    
    // Get user categories
    const categories = await getCategoriesForUser(userId)
    
    if (categories.length === 0) {
      return {
        label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
        confidence: CLASSIFICATION_CONFIG.ruleBased.defaultConfidence,
        method: 'keyword-default'
      }
    }
    
    // Get keyword configs for each category
    const categoryConfigs = {}
    for (const category of categories) {
      categoryConfigs[category.name] = KEYWORD_CATEGORIES[category.name] || null
    }
    
    // Separate categories by priority
    const highPriorityCategories = categories.filter(cat => {
      const config = categoryConfigs[cat.name]
      return config && config.priority === 'high'
    })
    const normalPriorityCategories = categories.filter(cat => {
      const config = categoryConfigs[cat.name]
      return !config || config.priority !== 'high' && config.priority !== 'low'
    })
    const lowPriorityCategories = categories.filter(cat => {
      const config = categoryConfigs[cat.name]
      return config && config.priority === 'low'
    })
    
    // Sort high-priority categories to check Professor before Placement
    highPriorityCategories.sort((a, b) => {
      if (a.name === 'Professor' && b.name !== 'Professor') return -1
      if (a.name !== 'Professor' && b.name === 'Professor') return 1
      if (a.name === 'Other' && b.name !== 'Other') return 1  // Other should be last
      if (a.name !== 'Other' && b.name === 'Other') return -1
      return 0
    })
    
    const allMatches = []
    
    // Check categories in priority order: Professor first, then other high-priority, then normal, then low
    const categoriesToCheck = [...highPriorityCategories, ...normalPriorityCategories, ...lowPriorityCategories]
    
    for (const category of categoriesToCheck) {
      const categoryConfig = categoryConfigs[category.name]
      if (!categoryConfig) continue
      
      // Check exclusions FIRST - if excluded, skip this category entirely
      if (shouldExcludeFromCategory(from, subject, snippet, categoryConfig)) {
        console.log(`⛔ Excluded from ${category.name}: ${subject}`)
        continue  // Skip this category
      }
      
      // First, check sender patterns (high confidence) - these take priority
      const senderMatch = matchSenderPatterns(from, category)
      if (senderMatch) {
        // For high-confidence sender matches (especially Professor, ServiceNow), return immediately
        if (senderMatch.confidence >= 0.90 && (
          category.name === 'Professor' || 
          category.name === 'Other' ||
          category.name === 'HOD' ||
          category.name === 'E-Zone'
        )) {
          console.log(`✅ High-confidence sender match: ${category.name} (${senderMatch.confidence})`)
          return {
            label: senderMatch.category,
            confidence: senderMatch.confidence,
            method: `sender-${senderMatch.method}`,
            matchedPattern: senderMatch.matchedPattern,
            matchedValue: senderMatch.matchedValue
          }
        }
        allMatches.push(senderMatch)
      }
      
      // Then check keyword matching (only if no high-confidence sender match)
      const keywordResults = matchKeywordsWithWeights(subject, snippet, body, categoryConfig)
      
      if (keywordResults.score > 0) {
        // Calculate confidence based on score
        const categoryWeight = CATEGORY_WEIGHTS[category.name] || 1.0
        const baseScore = keywordResults.score * categoryWeight
        
        // Normalize score to confidence (0.75 to 0.90 range)
        // Higher scores = higher confidence, but cap at 0.90 for keyword-only matches
        const normalizedScore = Math.min(baseScore / 10, 0.90)
        const confidence = Math.max(normalizedScore, 0.75) // Minimum 75% for keyword matches
        
        allMatches.push({
          category: category.name,
          confidence: Math.round(confidence * 100) / 100,
          method: keywordResults.matchedPhrases.length > 0 ? 'keyword+phrase' : 'keyword',
          matchedKeywords: keywordResults.matchedKeywords,
          matchedPhrases: keywordResults.matchedPhrases,
          keywordScore: keywordResults.score,
          priority: categoryConfig.priority || 'normal'
        })
      }
    }
    
    if (allMatches.length === 0) {
      // Check if it's ServiceNow or other known "Other" category emails
      const domain = extractSenderDomain(from)
      const isServiceNow = domain && (
        domain.includes('service-now.com') || 
        domain.includes('servicenow.com') || 
        domain.includes('nowlearning.com')
      )
      
      if (isServiceNow) {
        return {
          label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
          confidence: 0.90,
          method: 'keyword-service-now-other'
        }
      }
      
      return {
        label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
        confidence: CLASSIFICATION_CONFIG.ruleBased.defaultConfidence,
        method: 'keyword-no-match'
      }
    }
    
    // Sort matches by confidence (highest first)
    allMatches.sort((a, b) => {
      // Sort by confidence first
      if (Math.abs(b.confidence - a.confidence) > 0.05) {
        return b.confidence - a.confidence
      }
      // If confidence is similar, prioritize sender matches over keyword matches
      const aIsSender = a.method && (a.method.includes('sender') || a.method.includes('specific'))
      const bIsSender = b.method && (b.method.includes('sender') || b.method.includes('specific'))
      if (aIsSender && !bIsSender) return -1
      if (!aIsSender && bIsSender) return 1
      return 0
    })
    
    // Return best match, but only if confidence is good enough
    const bestMatch = allMatches[0]
    
    // If confidence is too low, fallback to "Other"
    if (bestMatch.confidence < CLASSIFICATION_CONFIG.ruleBased.keywordMinimumConfidence) {
      console.log(`⚠️ Low confidence match (${bestMatch.confidence}): ${subject} → Other`)
      return {
        label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
        confidence: CLASSIFICATION_CONFIG.ruleBased.defaultConfidence,
        method: 'keyword-low-confidence-fallback'
      }
    }
    
    return {
      label: bestMatch.category,
      confidence: bestMatch.confidence,
      method: `keyword-${bestMatch.method}`,
      matchedKeywords: bestMatch.matchedKeywords,
      matchedPhrases: bestMatch.matchedPhrases,
      matchedPattern: bestMatch.matchedPattern,
      matchedValue: bestMatch.matchedValue,
      keywordScore: bestMatch.keywordScore
    }
    
  } catch (error) {
    console.error('❌ Keyword classification error:', error)
    return {
      label: CLASSIFICATION_CONFIG.ruleBased.fallbackCategory,
      confidence: CLASSIFICATION_CONFIG.ruleBased.defaultConfidence,
      method: 'keyword-error',
      error: error.message
    }
  }
}

/**
 * Clear category cache
 * @param {string} userId - User ID
 */
export const clearCategoryCache = (userId) => {
  if (userId) {
    categoryCache.delete(`categories_${userId}`)
  } else {
    categoryCache.clear()
  }
}

export default {
  classifyWithKeywords,
  clearCategoryCache
}

