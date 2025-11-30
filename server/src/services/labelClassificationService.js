// Label-based email classification service
// Matches email Gmail labels to category mappings

import LabelMapping from '../models/LabelMapping.js'

// Cache for label mappings to reduce database queries
const labelMappingCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get label mappings for a user (with caching)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of label mappings
 */
const getLabelMappings = async (userId) => {
  const cacheKey = `label_mappings_${userId}`
  const cached = labelMappingCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  const mappings = await LabelMapping.getActiveMappings(userId)
  
  labelMappingCache.set(cacheKey, {
    data: mappings,
    timestamp: Date.now()
  })
  
  return mappings
}

/**
 * Clear label mapping cache for a user
 * @param {string} userId - User ID
 */
export const clearLabelMappingCache = (userId) => {
  if (userId) {
    labelMappingCache.delete(`label_mappings_${userId}`)
  } else {
    labelMappingCache.clear()
  }
}

/**
 * Match email labels to category mappings
 * @param {Array<string>} emailLabels - Array of Gmail label IDs from email
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Classification result or null if no match
 */
export const matchLabelsToCategory = async (emailLabels, userId) => {
  try {
    if (!emailLabels || !Array.isArray(emailLabels) || emailLabels.length === 0) {
      return null
    }
    
    if (!userId) {
      return null
    }
    
    // Get all active label mappings for user
    const mappings = await getLabelMappings(userId)
    
    if (mappings.length === 0) {
      return null
    }
    
    // Check each email label against mappings (sorted by priority)
    for (const label of emailLabels) {
      if (!label) continue
      
      // Find matching mapping
      for (const mapping of mappings) {
        let matches = false
        
        switch (mapping.matchType) {
          case 'exact':
            matches = mapping.label.toLowerCase() === label.toLowerCase()
            break
          case 'contains':
            matches = label.toLowerCase().includes(mapping.label.toLowerCase())
            break
          case 'regex':
            if (mapping.regexPattern) {
              try {
                const regex = new RegExp(mapping.regexPattern, 'i')
                matches = regex.test(label)
              } catch (error) {
                console.error(`Invalid regex pattern for mapping ${mapping._id}:`, error)
              }
            }
            break
        }
        
        if (matches) {
          console.log(`✅ Label match: "${label}" → ${mapping.categoryName} (priority: ${mapping.priority})`)
          return {
            label: mapping.categoryName,
            confidence: 0.95, // High confidence for label-based classification
            method: 'label-mapping',
            matchedLabel: label,
            mappingId: mapping._id.toString(),
            priority: mapping.priority
          }
        }
      }
    }
    
    // No matches found
    return null
    
  } catch (error) {
    console.error('❌ Label classification error:', error)
    return null
  }
}

/**
 * Check if a specific label matches any category mapping
 * @param {string} label - Label to check
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Matching mapping or null
 */
export const findCategoryForLabel = async (label, userId) => {
  try {
    if (!label || !userId) {
      return null
    }
    
    const mapping = await LabelMapping.findCategoryForLabel(label, userId)
    
    if (mapping) {
      return {
        categoryName: mapping.categoryName,
        confidence: 0.95,
        mappingId: mapping._id.toString()
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ Error finding category for label:', error)
    return null
  }
}

export default {
  matchLabelsToCategory,
  findCategoryForLabel,
  clearLabelMappingCache
}

