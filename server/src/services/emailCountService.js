/**
 * Unified Email Count Service
 * Single source of truth for email counts - ensures consistency across all endpoints
 * Uses exact same query structure as email list endpoint
 * NO caching - always returns real-time counts
 */

import Email from '../models/Email.js'
import mongoose from 'mongoose'

const toObjectId = (userId) => {
  return typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
}

/**
 * Base query structure matching email list endpoint exactly
 * This ensures counts are consistent across email list, analytics, and category labels
 */
const getBaseQuery = (userId) => {
  return {
    userId: toObjectId(userId),
    isDeleted: false,  // Exclude deleted emails for consistency
    $or: [
      { provider: 'gmail' },  // Match email list endpoint default provider filter
      { provider: { $exists: false } }  // Include emails without provider field (legacy emails)
    ]
  }
}

/**
 * Get email count for a specific category for a user
 * @param {string} userId - User ID
 * @param {string} categoryName - Name of the category
 * @returns {Promise<number>} Number of emails in the category
 */
export const getCategoryEmailCount = async (userId, categoryName) => {
  try {
    if (!userId || !categoryName) {
      throw new Error('User ID and category name are required')
    }
    
    const query = {
      ...getBaseQuery(userId),
      category: categoryName
    }
    
    return await Email.countDocuments(query)
  } catch (error) {
    console.error(`Error getting count for category ${categoryName}:`, error)
    throw error
  }
}

/**
 * Get counts for all categories for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array<{_id: string, count: number}>>} Array of category counts
 */
export const getAllCategoryCounts = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    return await Email.aggregate([
      {
        $match: getBaseQuery(userId)
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ])
  } catch (error) {
    console.error('Error getting all category counts:', error)
    throw error
  }
}

/**
 * Get total email count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Total number of emails
 */
export const getTotalEmailCount = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    return await Email.countDocuments(getBaseQuery(userId))
  } catch (error) {
    console.error('Error getting total email count:', error)
    throw error
  }
}

/**
 * Get email count with custom query (for advanced analytics)
 * @param {string} userId - User ID
 * @param {Object} additionalFilters - Additional MongoDB query filters
 * @returns {Promise<number>} Number of emails matching the query
 */
export const getEmailCountWithFilters = async (userId, additionalFilters = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    const query = {
      ...getBaseQuery(userId),
      ...additionalFilters
    }
    
    return await Email.countDocuments(query)
  } catch (error) {
    console.error('Error getting email count with filters:', error)
    throw error
  }
}

