// Utility functions for matching sender patterns

/**
 * Extract email domain from sender string
 * @param {string} from - Email sender (e.g., "Name <email@domain.com>" or "email@domain.com")
 * @returns {string|null} - Domain or null if not found
 */
export const extractSenderDomain = (from) => {
  if (!from) return null
  
  // Extract email from "Name <email@domain.com>" format
  const emailMatch = from.match(/<(.+?)>/)
  const email = emailMatch ? emailMatch[1] : from
  
  // Extract domain from email
  const domainMatch = email.match(/@(.+)$/)
  return domainMatch ? domainMatch[1].trim() : null
}

/**
 * Extract sender name from sender string
 * @param {string} from - Email sender
 * @returns {string|null} - Sender name or null
 */
export const extractSenderName = (from) => {
  if (!from) return null
  
  // Extract name from "Name <email@domain.com>" format
  const nameMatch = from.match(/^([^<]+)</)
  if (nameMatch) {
    return nameMatch[1].trim()
  }
  
  // If no angle brackets, return everything before @ symbol
  const beforeAt = from.split('@')[0]
  return beforeAt.trim()
}

/**
 * Check if sender domain matches pattern
 * @param {string} domain - Sender domain
 * @param {string} pattern - Domain pattern (can include wildcards)
 * @returns {boolean} - True if matches
 */
export const matchesDomainPattern = (domain, pattern) => {
  if (!domain || !pattern) return false
  
  // Exact match
  if (domain.toLowerCase() === pattern.toLowerCase()) {
    return true
  }
  
  // Wildcard pattern (e.g., "*.sharda.ac.in")
  if (pattern.includes('*')) {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
    const regex = new RegExp(`^${regexPattern}$`, 'i')
    return regex.test(domain)
  }
  
  return false
}

/**
 * Check if sender name matches pattern
 * @param {string} name - Sender name
 * @param {string} pattern - Name pattern (can be regex-like)
 * @returns {boolean} - True if matches
 */
export const matchesNamePattern = (name, pattern) => {
  if (!name || !pattern) return false
  
  // Case-insensitive contains check
  return name.toLowerCase().includes(pattern.toLowerCase())
}

/**
 * Count keyword matches in text
 * @param {string} text - Text to search
 * @param {Array<string>} keywords - Keywords to find
 * @returns {Object} - {count, matchedKeywords, score}
 */
export const countKeywordMatches = (text, keywords) => {
  if (!text || !keywords || keywords.length === 0) {
    return { count: 0, matchedKeywords: [], score: 0 }
  }
  
  const lowerText = text.toLowerCase()
  const matchedKeywords = []
  let totalScore = 0
  
  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase()
    
    // Word boundary regex for better matching
    const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    const matches = lowerText.match(regex)
    
    if (matches && matches.length > 0) {
      matchedKeywords.push(keyword)
      
      // Score based on number of matches and keyword length
      const keywordScore = matches.length * (keyword.length > 5 ? 1.5 : 1)
      totalScore += keywordScore
    }
  })
  
  return {
    count: matchedKeywords.length,
    matchedKeywords,
    score: totalScore
  }
}

/**
 * Calculate confidence based on matches
 * @param {Object} matches - Match results
 * @param {number} baseConfidence - Base confidence level
 * @returns {number} - Confidence score (0-1)
 */
export const calculateConfidence = (matches, baseConfidence) => {
  let confidence = baseConfidence
  
  // Boost confidence based on number of keyword matches
  if (matches.score > 0) {
    const boost = Math.min(matches.score * 0.02, 0.15) // Max 15% boost
    confidence = Math.min(confidence + boost, 0.95)
  }
  
  return Math.round(confidence * 100) / 100 // Round to 2 decimals
}

/**
 * Extract professor title from sender name
 * @param {string} from - Email sender
 * @returns {Object|null} - {title, name} or null
 */
export const extractProfessorTitle = (from) => {
  if (!from) return null
  
  // Pattern 1: "Dr. Nishant Gupta (CSE Associate Professor)" - check parentheses first
  const parenPattern = /\(([^)]*(?:Assistant|Associate)?\s*(?:Professor|Faculty|Prof\.).*?)\)/i
  const parenMatch = from.match(parenPattern)
  if (parenMatch) {
    const titleInParen = parenMatch[1].trim()
    // Extract name before parentheses
    const nameMatch = from.match(/^([^(<]+)/)
    const name = nameMatch ? nameMatch[1].trim() : extractSenderName(from)
    return {
      title: titleInParen,
      name: name,
      fullMatch: parenMatch[0].trim()
    }
  }
  
  // Pattern 2: "Dr. Nishant Gupta" at start
  const drNamePattern = /\b(Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
  const drMatch = from.match(drNamePattern)
  if (drMatch) {
    return {
      title: drMatch[1],
      name: drMatch[2],
      fullMatch: drMatch[0].trim()
    }
  }
  
  // Pattern 3: "(Assistant Professor)" or "(Associate Professor)" anywhere
  const profPattern = /(Assistant|Associate)?\s*(?:Professor|Prof\.|Faculty)/i
  if (profPattern.test(from)) {
    const name = extractSenderName(from)
    return {
      title: 'Professor',
      name: name,
      fullMatch: from
    }
  }
  
  // Pattern 4: "Dr." anywhere in sender
  if (/Dr\./i.test(from)) {
    const name = extractSenderName(from)
    return {
      title: 'Dr.',
      name: name,
      fullMatch: from
    }
  }
  
  return null
}

/**
 * Match multi-word phrases in text
 * @param {string} text - Text to search
 * @param {Array<string>} phrases - Phrases to find
 * @returns {Object} - {count, matchedPhrases, score}
 */
export const matchPhrases = (text, phrases) => {
  if (!text || !phrases || phrases.length === 0) {
    return { count: 0, matchedPhrases: [], score: 0 }
  }
  
  const lowerText = text.toLowerCase()
  const matchedPhrases = []
  let totalScore = 0
  
  phrases.forEach(phrase => {
    const lowerPhrase = phrase.toLowerCase()
    
    // Escape special regex characters
    const escapedPhrase = lowerPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escapedPhrase, 'gi')
    const matches = lowerText.match(regex)
    
    if (matches && matches.length > 0) {
      matchedPhrases.push(phrase)
      
      // Higher score for phrase matches (they're more specific)
      const phraseScore = matches.length * 2.5
      totalScore += phraseScore
    }
  })
  
  return {
    count: matchedPhrases.length,
    matchedPhrases,
    score: totalScore
  }
}

/**
 * Check if sender email exactly matches a pattern
 * @param {string} from - Email sender
 * @param {string} emailPattern - Email address pattern
 * @returns {boolean} - True if matches
 */
export const matchesExactEmail = (from, emailPattern) => {
  if (!from || !emailPattern) return false
  
  // Extract email from "Name <email@domain.com>" format
  const emailMatch = from.match(/<(.+?)>/)
  const email = emailMatch ? emailMatch[1].trim().toLowerCase() : from.trim().toLowerCase()
  
  return email === emailPattern.toLowerCase()
}

/**
 * Check for specific sender patterns (HOD, E-Zone, NPTEL, etc.)
 * @param {string} from - Email sender
 * @param {string} categoryName - Category name to check
 * @returns {Object|null} - Match result or null
 */
export const matchSpecificSender = (from, categoryName) => {
  if (!from || !categoryName) return null
  
  const lowerFrom = from.toLowerCase()
  const senderName = extractSenderName(from) || ''
  const domain = extractSenderDomain(from) || ''
  
  // HOD-specific patterns
  if (categoryName === 'HOD') {
    // Check for HOD email domains (hod.xxx@sharda.ac.in)
    if (domain.includes('hod.') && domain.includes('sharda.ac.in')) {
      return { matched: true, confidence: 0.98, pattern: 'HOD domain' }
    }
    // Check for HOD in sender name or full from string
    if (lowerFrom.includes('hod cse') || 
        lowerFrom.includes('hod ece') ||
        lowerFrom.includes('hod me') ||
        lowerFrom.includes('hod ce') ||
        lowerFrom.includes('hod ') ||
        senderName.toLowerCase().includes('hod') ||
        lowerFrom.includes('head of department') ||
        lowerFrom.includes('head of dept')) {
      return { matched: true, confidence: 0.95, pattern: 'HOD sender' }
    }
  }
  
  // E-Zone-specific patterns
  if (categoryName === 'E-Zone') {
    if (lowerFrom.includes('ezone@shardauniversity.com') || 
        lowerFrom.includes('e-zone online portal') ||
        domain.includes('ezone')) {
      return { matched: true, confidence: 0.98, pattern: 'E-Zone sender' }
    }
  }
  
  // NPTEL-specific patterns
  if (categoryName === 'NPTEL') {
    if (domain.includes('nptel.iitm.ac.in') || 
        domain.includes('nptel.ac.in') ||
        lowerFrom.includes('onlinecourses@nptel')) {
      return { matched: true, confidence: 0.95, pattern: 'NPTEL sender' }
    }
  }
  
  // Professor-specific patterns
  if (categoryName === 'Professor') {
    // Check for specific professor names first (highest confidence)
    const professorNames = [
      'nishant gupta', 'kanika singla', 'anubhava srivastava', 'kapil kumar',
      'preeti sharma'
    ]
    const lowerName = senderName.toLowerCase()
    for (const profName of professorNames) {
      if (lowerName.includes(profName.toLowerCase())) {
        return { matched: true, confidence: 0.95, pattern: 'Professor name match', name: profName }
      }
    }
    
    // Check for professor title patterns
    const profTitle = extractProfessorTitle(from)
    if (profTitle) {
      return { matched: true, confidence: 0.92, pattern: 'Professor title', title: profTitle }
    }
    
    // Check for email domain patterns (sharda.ac.in with professor indicators)
    if (domain.includes('sharda.ac.in')) {
      // Check if sender name contains professor indicators
      if (lowerName.includes('professor') || lowerName.includes('dr.') || 
          lowerName.includes('assistant professor') || lowerName.includes('associate professor')) {
        return { matched: true, confidence: 0.88, pattern: 'Professor domain + name', domain: domain }
      }
    }
  }
  
  // ServiceNow-specific patterns (for "Other" category)
  if (categoryName === 'Other') {
    // ServiceNow patterns
    if (domain.includes('service-now.com') || domain.includes('servicenow.com') || 
        domain.includes('nowlearning.com') || domain.includes('signonmail.servicenow.com')) {
      return { matched: true, confidence: 0.95, pattern: 'ServiceNow domain', domain: domain }
    }
    if (lowerFrom.includes('servicenow university') || lowerFrom.includes('nowlearning@')) {
      return { matched: true, confidence: 0.95, pattern: 'ServiceNow sender', sender: from }
    }
    
    // OpenAI/ChatGPT patterns
    if (domain.includes('email.openai.com') || domain.includes('openai.com') || 
        domain.includes('chatgpt.com')) {
      return { matched: true, confidence: 0.95, pattern: 'OpenAI/ChatGPT domain', domain: domain }
    }
    if (lowerFrom.includes('chatgpt') || lowerFrom.includes('openai') || 
        lowerFrom.includes('noreply@email.openai.com')) {
      return { matched: true, confidence: 0.95, pattern: 'OpenAI/ChatGPT sender', sender: from }
    }
  }
  
  // Promotions-specific patterns
  if (categoryName === 'Promotions') {
    // Check for "'Promotions' via" pattern (with quotes)
    if (lowerFrom.includes("'promotions' via") || 
        lowerFrom.includes('"promotions" via') ||
        lowerFrom.includes("promotions' via")) {
      return { matched: true, confidence: 0.95, pattern: 'Promotions sender' }
    }
    // Check for "Promotions via UG Student Group" pattern
    if (lowerFrom.includes('promotions via ug student group') ||
        lowerFrom.includes('promotions via')) {
      return { matched: true, confidence: 0.92, pattern: 'Promotions sender' }
    }
    // Check sender name for "Promotions"
    if (senderName.toLowerCase().includes('promotions')) {
      return { matched: true, confidence: 0.90, pattern: 'Promotions in sender name' }
    }
  }
  
  // Whats happening-specific patterns
  if (categoryName === 'Whats happening') {
    if (lowerFrom.includes("'what's happening' via") || 
        lowerFrom.includes("what's happening via") ||
        lowerFrom.includes('whatshappening@')) {
      return { matched: true, confidence: 0.92, pattern: 'Whats happening sender' }
    }
  }
  
  return null
}

