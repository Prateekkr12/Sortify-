/**
 * Category Count Service
 * Provides consistent category email counts across all endpoints
 * Ensures data consistency between email list, analytics, and category tabs
 */

import mongoose from 'mongoose'
import Email from '../models/Email.js'

/**
 * Get count of emails for a specific category
 * Uses consistent query structure: userId + isDeleted: false + category
 * 
 * @param {string|ObjectId} userId - User ID
 * @param {string} categoryName - Category name (null/undefined for all categories)
 * @returns {Promise<number>} Count of emails in category
 */
export const getCategoryEmailCount = async (userId, categoryName = null) => {
  try {
    const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
    
    const query = {
      userId: userIdObj,
      isDeleted: false  // Always exclude deleted emails for consistency
    }
    
    // Add category filter if specified
    if (categoryName && categoryName !== 'All' && categoryName !== 'all') {
      query.category = categoryName
    }
    
    const count = await Email.countDocuments(query)
    return count
  } catch (error) {
    console.error('Error getting category email count:', error)
    throw error
  }
}

/**
 * Get counts for all categories for a user
 * Returns a map of category name -> count
 * 
 * @param {string|ObjectId} userId - User ID
 * @returns {Promise<Map<string, number>>} Map of category name to count
 */
export const getAllCategoryCounts = async (userId) => {
  try {
    const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
    
    // Use aggregation to get all category counts in one query
    const emailCounts = await Email.aggregate([
      { 
        $match: { 
          userId: userIdObj,
          isDeleted: false  // Always exclude deleted emails for consistency
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 } 
        } 
      }
    ])
    
    // Create a Map for O(1) lookups
    const countMap = new Map(
      emailCounts.map(item => [item._id, item.count])
    )
    
    return countMap
  } catch (error) {
    console.error('Error getting all category counts:', error)
    throw error
  }
}

/**
 * Get total email count for a user (excluding deleted)
 * 
 * @param {string|ObjectId} userId - User ID
 * @returns {Promise<number>} Total count of non-deleted emails
 */
export const getTotalEmailCount = async (userId) => {
  try {
    const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
    
    const count = await Email.countDocuments({
      userId: userIdObj,
      isDeleted: false
    })
    
    return count
  } catch (error) {
    console.error('Error getting total email count:', error)
    throw error
  }
}

