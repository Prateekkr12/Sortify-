// Phase 1: Fast rule-based email classification using sender patterns and keywords
import Category from '../models/Category.js'
import { CLASSIFICATION_CONFIG } from '../config/classification.js'
import {
  extractSenderDomain,
  extractSenderName,
  matchesDomainPattern,
  matchesNamePattern,
  countKeywordMatches,
  calculateConfidence,
  matchPhrases,
  matchSpecificSender,
  extractProfessorTitle
} from '../utils/senderPatternMatcher.js'

// Cache for user categories to reduce database queries
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
 * Clear category cache (global)
 */
export const clearCategoryCache = () => {
  categoryCache.clear()
}

/**
 * Match email against category sender domain patterns
 * @param {string} from - Email sender
 * @param {Object} category - Category with patterns
 * @returns {Object|null} - Match result or null
 */
const matchSenderDomain = (from, category) => {
  if (!category.patterns || !category.patterns.senderDomains) {
    return null
  }
  
  const domain = extractSenderDomain(from)
  if (!domain) return null
  
  for (const pattern of category.patterns.senderDomains) {
    if (matchesDomainPattern(domain, pattern)) {
      return {
        category: category.name,
        confidence: CLASSIFICATION_CONFIG.phase1.senderDomainConfidence,
        method: 'sender-domain',
        matchedPattern: pattern,
        matchedValue: domain
      }
    }
  }
  
  return null
}

/**
 * Match email against category sender name patterns
 * @param {string} from - Email sender
 * @param {Object} category - Category with patterns
 * @returns {Object|null} - Match result or null
 */
const matchSenderName = (from, category) => {
  if (!category.patterns || !category.patterns.senderNames) {
    return null
  }
  
  const name = extractSenderName(from)
  if (!name) return null
  
  for (const pattern of category.patterns.senderNames) {
    if (matchesNamePattern(name, pattern)) {
      return {
        category: category.name,
        confidence: CLASSIFICATION_CONFIG.phase1.senderNameConfidence,
        method: 'sender-name',
        matchedPattern: pattern,
        matchedValue: name
      }
    }
  }
  
  return null
}

/**
 * Match email against category keywords and phrases in body
 * @param {string} body - Email body
 * @param {Object} category - Category with keywords
 * @returns {Object|null} - Match result or null
 */
const matchBodyKeywords = (body, category) => {
  if (!category.keywords || category.keywords.length === 0) {
    return null
  }
  
  // Check body for keyword matching (subject is checked separately first)
  const keywordMatches = countKeywordMatches(body || '', category.keywords)
  
  // Also check for phrase matches if classificationStrategy exists
  let phraseMatches = { count: 0, matchedPhrases: [], score: 0 }
  if (category.classificationStrategy?.bodyAnalysis?.phrases) {
    phraseMatches = matchPhrases(body || '', category.classificationStrategy.bodyAnalysis.phrases)
  }
  
  const totalMatches = keywordMatches.count + phraseMatches.count
  const totalScore = keywordMatches.score + phraseMatches.score
  
  if (totalMatches > 0) {
    const combinedMatches = {
      count: totalMatches,
      score: totalScore
    }
    
    const confidence = calculateConfidence(
      combinedMatches,
      CLASSIFICATION_CONFIG.phase1.keywordConfidence
    )
    
    return {
      category: category.name,
      confidence,
      method: phraseMatches.count > 0 ? 'body-keyword+phrase' : 'body-keyword',
      matchedKeywords: keywordMatches.matchedKeywords,
      matchedPhrases: phraseMatches.matchedPhrases,
      keywordScore: totalScore
    }
  }
  
  return null
}

/**
 * Check category for any match (domain, name, keyword, phrase, or specific sender)
 * Note: Subject is checked separately before this function is called
 * @param {Object} email - Email data
 * @param {Object} category - Category to check
 * @returns {Object|null} - Best match or null
 */
const checkCategoryMatch = (email, category) => {
  const { from = '', body = '' } = email
  const matches = []
  
  // Priority 1: Check for specific sender patterns (HOD, E-Zone, NPTEL, Professor, etc.)
  const specificSenderMatch = matchSpecificSender(from, category.name)
  if (specificSenderMatch && specificSenderMatch.matched) {
    matches.push({
      category: category.name,
      confidence: specificSenderMatch.confidence,
      method: 'specific-sender',
      matchedPattern: specificSenderMatch.pattern,
      matchedValue: from,
      professorTitle: specificSenderMatch.title
    })
  }
  
  // Priority 2: Check sender domain
  const domainMatch = matchSenderDomain(from, category)
  if (domainMatch) {
    matches.push(domainMatch)
  }
  
  // Priority 3: Check sender name
  const nameMatch = matchSenderName(from, category)
  if (nameMatch) {
    matches.push(nameMatch)
  }
  
  // Priority 4: Check body keywords and phrases (subject was already checked separately)
  const bodyKeywordMatch = matchBodyKeywords(body, category)
  if (bodyKeywordMatch) {
    matches.push(bodyKeywordMatch)
  }
  
  // Return best match (highest confidence)
  if (matches.length > 0) {
    return matches.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    )
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
 * Phase 1: Fast rule-based email classification with priority-based matching
 * @param {Object} email - Email data {subject, from, snippet, body}
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Classification result
 */
export const classifyEmailPhase1 = async (email, userId) => {
  const { subject = '', from = '', snippet = '', body = '' } = email
  
  try {
    // Get global categories
    const categories = await getCategoriesForUser()
    
    if (categories.length === 0) {
      console.log('⚠️ Phase 1: No categories found for user, using default')
      return {
        label: CLASSIFICATION_CONFIG.phase1.fallbackCategory,
        confidence: CLASSIFICATION_CONFIG.phase1.defaultConfidence,
        method: 'phase1-default',
        phase: 1,
        matchedPatterns: []
      }
    }
    
    // PRIORITY 0: Check if subject contains category name keyword (HIGHEST PRIORITY)
    // This check happens before everything else - subject match takes precedence
    for (const category of categories) {
      if (subjectContainsCategoryKeyword(subject, category.name)) {
        console.log(`✅ Phase 1 [SUBJECT KEYWORD]: Match - "${subject}" → ${category.name} (confidence: 0.98)`)
        return {
          label: category.name,
          confidence: 0.98, // Very high confidence for explicit category name in subject
          method: 'phase1-subject-category-keyword',
          phase: 1,
          matchedPattern: `Subject contains "${category.name}" keyword`,
          matchedValue: subject
        }
      }
    }
    
    // Separate categories by priority
    const highPriorityCategories = categories.filter(cat => cat.priority === 'high')
    const normalPriorityCategories = categories.filter(cat => !cat.priority || cat.priority === 'normal')
    const lowPriorityCategories = categories.filter(cat => cat.priority === 'low')
    
    // Sort high-priority categories - prioritize "Promotions", "Whats happening", and "HOD" if sender matches
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
                       fromLower.includes('head of department') ||
                       fromLower.includes('head of dept')
    
    if (isPromotionsSender || isWhatsHappeningSender || isHODSender) {
      highPriorityCategories.sort((a, b) => {
        // Prioritize "Promotions" if sender matches
        if (isPromotionsSender) {
          if (a.name === 'Promotions' && b.name !== 'Promotions') return -1
          if (a.name !== 'Promotions' && b.name === 'Promotions') return 1
        }
        // Prioritize "Whats happening" if sender matches
        if (isWhatsHappeningSender) {
          if (a.name === 'Whats happening' && b.name !== 'Whats happening') return -1
          if (a.name !== 'Whats happening' && b.name === 'Whats happening') return 1
        }
        // Prioritize "HOD" if sender matches - BEFORE Professor
        if (isHODSender) {
          if (a.name === 'HOD' && b.name !== 'HOD') return -1
          if (a.name !== 'HOD' && b.name === 'HOD') return 1
        }
        // Check HOD before Professor
        if (a.name === 'HOD' && b.name === 'Professor') return -1
        if (a.name === 'Professor' && b.name === 'HOD') return 1
        return 0
      })
    }
    
    // Priority Level 1: Check high-priority categories (Promotions, Placement, NPTEL, etc.)
    for (const category of highPriorityCategories) {
      const match = checkCategoryMatch(email, category)
      if (match && match.confidence >= 0.75) {
        console.log(`✅ Phase 1 [HIGH]: Match - "${subject}" → ${match.category} (${match.confidence}) via ${match.method}`)
        return {
          label: match.category,
          confidence: match.confidence,
          method: `phase1-${match.method}`,
          phase: 1,
          matchedPattern: match.matchedPattern,
          matchedValue: match.matchedValue,
          matchedKeywords: match.matchedKeywords,
          keywordScore: match.keywordScore,
          priorityLevel: 'high'
        }
      }
    }
    
    // Priority Level 2: Check normal-priority categories
    for (const category of normalPriorityCategories) {
      const match = checkCategoryMatch(email, category)
      if (match) {
        console.log(`✅ Phase 1 [NORMAL]: Match - "${subject}" → ${match.category} (${match.confidence}) via ${match.method}`)
        return {
          label: match.category,
          confidence: match.confidence,
          method: `phase1-${match.method}`,
          phase: 1,
          matchedPattern: match.matchedPattern,
          matchedValue: match.matchedValue,
          matchedKeywords: match.matchedKeywords,
          keywordScore: match.keywordScore,
          priorityLevel: 'normal'
        }
      }
    }
    
    // Priority Level 3: Check low-priority categories (HOD)
    for (const category of lowPriorityCategories) {
      const match = checkCategoryMatch(email, category)
      if (match) {
        console.log(`✅ Phase 1 [LOW]: Match - "${subject}" → ${match.category} (${match.confidence}) via ${match.method}`)
        return {
          label: match.category,
          confidence: match.confidence,
          method: `phase1-${match.method}`,
          phase: 1,
          matchedPattern: match.matchedPattern,
          matchedValue: match.matchedValue,
          matchedKeywords: match.matchedKeywords,
          keywordScore: match.keywordScore,
          priorityLevel: 'low'
        }
      }
    }
    
    // No matches found - use fallback
    console.log(`⚠️ Phase 1: No matches - "${subject}" → ${CLASSIFICATION_CONFIG.phase1.fallbackCategory} (${CLASSIFICATION_CONFIG.phase1.defaultConfidence})`)
    return {
      label: CLASSIFICATION_CONFIG.phase1.fallbackCategory,
      confidence: CLASSIFICATION_CONFIG.phase1.defaultConfidence,
      method: 'phase1-default',
      phase: 1,
      matchedPatterns: []
    }
    
  } catch (error) {
    console.error('❌ Phase 1 classification error:', error)
    // Return fallback on error
    return {
      label: CLASSIFICATION_CONFIG.phase1.fallbackCategory,
      confidence: CLASSIFICATION_CONFIG.phase1.defaultConfidence,
      method: 'phase1-error',
      phase: 1,
      error: error.message
    }
  }
}

export default classifyEmailPhase1


