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
 * Get categories (global - no userId needed)
 * @returns {Promise<Array>} - Global categories
 */
const getCategoriesForUser = async () => {
  const cacheKey = 'global_categories_classification'
  const cached = categoryCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  const categories = await Category.find({ 
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
    const fromLower = (from || '').toLowerCase()
    for (const excludeName of categoryConfig.patterns.excludeNames) {
      const lowerExclude = excludeName.toLowerCase()
      // Check both extracted name and full sender string
      if (name) {
        const lowerName = name.toLowerCase()
        if (lowerName === lowerExclude || lowerName.includes(lowerExclude)) {
          console.log(`⛔ Name exclusion match: ${name} excludes ${excludeName}`)
          return true
        }
      }
      // Also check full sender string for patterns like "'What's Happening' via..."
      if (fromLower.includes(lowerExclude)) {
        console.log(`⛔ Sender exclusion match: ${from} excludes ${excludeName}`)
        return true
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
 * Check if subject contains category name keyword (highest priority check)
 * @param {string} subject - Email subject
 * @param {string} categoryName - Category name
 * @returns {boolean} - True if subject contains category keyword
 */
const subjectContainsCategoryKeyword = (subject, categoryName) => {
  if (!subject || !categoryName) return false
  
  const subjectLower = subject.toLowerCase()
  
  // Map category names to their keyword variations
  const categoryKeywords = {
    'HOD': ['hod'],
    'NPTEL': ['nptel'],
    'Professor': ['professor'],
    'Placement': ['placement'],
    'Promotions': ['promotions', 'promotion'],
    'Whats happening': ['what\'s happening', 'whats happening'],
    'E-Zone': ['e-zone', 'ezone'],
    'Other': [] // Skip "Other" category
  }
  
  const keywords = categoryKeywords[categoryName]
  if (!keywords || keywords.length === 0) return false
  
  // Check if any keyword appears in subject (using word boundaries for better matching)
  for (const keyword of keywords) {
    // Use word boundary regex to match whole words only
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (regex.test(subject)) {
      return true
    }
  }
  
  return false
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
    
    // Get global categories
    const categories = await getCategoriesForUser()
    
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
    
    // PRIORITY 0: Check if subject contains category name keyword (HIGHEST PRIORITY)
    // This check happens before everything else - subject match takes precedence
    for (const category of categories) {
      if (subjectContainsCategoryKeyword(subject, category.name)) {
        const categoryConfig = categoryConfigs[category.name]
        if (categoryConfig) {
          // Skip if excluded
          if (!shouldExcludeFromCategory(from, subject, snippet, categoryConfig)) {
            console.log(`✅ Subject category keyword match: "${subject}" → ${category.name} (confidence: 0.98)`)
            return {
              label: category.name,
              confidence: 0.98, // Very high confidence for explicit category name in subject
              method: 'subject-category-keyword',
              matchedPattern: `Subject contains "${category.name}" keyword`,
              matchedValue: subject
            }
          }
        }
      }
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
    
    // Sort high-priority categories - check Promotions, What's Happening, and HOD first if sender matches
    const fromLower = (from || '').toLowerCase()
    const domain = extractSenderDomain(from) || ''
    const domainLower = domain.toLowerCase()
    
    const isPromotionsSender = fromLower.includes("'promotions' via") || 
                              fromLower.includes("promotions via") ||
                              fromLower.includes("promotions' via")
    const isWhatsHappeningSender = fromLower.includes("what's happening") || 
                                   fromLower.includes("whats happening") ||
                                   fromLower.includes("batch2022-2023")
    const isHODSender = fromLower.includes('hod cse') || 
                       fromLower.includes('hod ') ||
                       domainLower.includes('hod.') ||
                       domainLower.startsWith('hod') ||
                       fromLower.includes('head of department') ||
                       fromLower.includes('head of dept')
    
    highPriorityCategories.sort((a, b) => {
      // Prioritize "Promotions" if sender matches its patterns
      if (isPromotionsSender) {
        if (a.name === 'Promotions' && b.name !== 'Promotions') return -1
        if (a.name !== 'Promotions' && b.name === 'Promotions') return 1
      }
      // Prioritize "Whats happening" if sender matches its patterns
      if (isWhatsHappeningSender) {
        if (a.name === 'Whats happening' && b.name !== 'Whats happening') return -1
        if (a.name !== 'Whats happening' && b.name === 'Whats happening') return 1
      }
      // Prioritize "HOD" if sender matches its patterns - BEFORE Professor
      if (isHODSender) {
        if (a.name === 'HOD' && b.name !== 'HOD') return -1
        if (a.name !== 'HOD' && b.name === 'HOD') return 1
      }
      // Check HOD before Professor (HOD takes priority)
      if (a.name === 'HOD' && b.name === 'Professor') return -1
      if (a.name === 'Professor' && b.name === 'HOD') return 1
      // Otherwise, check Professor before Placement (original logic)
      if (a.name === 'Professor' && b.name !== 'Professor' && b.name !== 'HOD') return -1
      if (a.name !== 'Professor' && a.name !== 'HOD' && b.name === 'Professor') return 1
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
      
      // PRIORITY 1: Check sender patterns (high confidence) - these take priority after subject
      const senderMatch = matchSenderPatterns(from, category)
      if (senderMatch) {
        // For high-confidence sender matches, return immediately
        if (senderMatch.confidence >= 0.90 && (
          category.name === 'Promotions' ||
          category.name === 'Whats happening' ||
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
      
      // PRIORITY 2: Check body for keywords (only if no high-confidence sender match)
      // Check body separately (not subject/snippet) since subject was already checked above
      const bodyKeywordResults = matchKeywordsWithWeights('', '', body, categoryConfig)
      
      if (bodyKeywordResults.score > 0) {
        // Calculate confidence based on score
        const categoryWeight = CATEGORY_WEIGHTS[category.name] || 1.0
        const baseScore = bodyKeywordResults.score * categoryWeight
        
        // Normalize score to confidence (0.75 to 0.90 range)
        // Higher scores = higher confidence, but cap at 0.90 for keyword-only matches
        const normalizedScore = Math.min(baseScore / 10, 0.90)
        const confidence = Math.max(normalizedScore, 0.75) // Minimum 75% for keyword matches
        
        allMatches.push({
          category: category.name,
          confidence: Math.round(confidence * 100) / 100,
          method: bodyKeywordResults.matchedPhrases.length > 0 ? 'body-keyword+phrase' : 'body-keyword',
          matchedKeywords: bodyKeywordResults.matchedKeywords,
          matchedPhrases: bodyKeywordResults.matchedPhrases,
          keywordScore: bodyKeywordResults.score,
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
 * Clear category cache (global)
 */
export const clearCategoryCache = () => {
  categoryCache.clear()
}

export default {
  classifyWithKeywords,
  clearCategoryCache
}

