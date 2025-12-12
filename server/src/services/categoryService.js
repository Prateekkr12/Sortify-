// Category service for managing user-specific categories with database persistence
import mongoose from 'mongoose'
import Category, { DEFAULT_CATEGORY_NAMES } from '../models/Category.js'
import Email from '../models/Email.js'
import { startReclassificationJob } from './emailReclassificationService.js'

// Helper function to convert userId to ObjectId
const toObjectId = (userId) => {
  return typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId
}

// Cache for category data to improve performance
// Reduced TTL for real-time accuracy - counts update within 30 seconds
const categoryCache = new Map()
const CACHE_TTL = 30 * 1000 // 30 seconds for real-time counts

/**
 * Clear category cache (global cache)
 */
export const clearCategoryCache = () => {
  categoryCache.clear()
  console.log(`🗑️ Cleared global category cache`)
}

/**
 * Get all categories (global - for any user, but counts are user-specific)
 * @param {string} userId - User ID (optional, only used for email counts)
 * @returns {Promise<Array>} Array of categories
 */
export const getCategories = async (userId = null) => {
  try {
    const CACHE_KEY = 'global_categories'

    // Check cache first
    const cached = categoryCache.get(CACHE_KEY)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`✅ Returning cached global categories`)
      // If userId provided, enrich with user-specific counts
      if (userId) {
        const { getAllCategoryCounts } = await import('./emailCountService.js')
        const emailCounts = await getAllCategoryCounts(userId.toString())
        const countMap = new Map(
          emailCounts.map(item => [item._id, item.count])
        )
        return cached.data.map(cat => ({
          ...cat,
          count: countMap.get(cat.name) || 0
        }))
      }
      return cached.data
    }

    console.time('getCategories-global')

    // Ensure default categories exist (global)
    const allCategories = await Category.getOrCreateDefaults()
    
    // Filter to only active categories
    const categories = allCategories.filter(category => category.isActive !== false)
    
    // Get user-specific counts if userId provided
    let countMap = new Map()
    if (userId) {
      const { getAllCategoryCounts } = await import('./emailCountService.js')
      const emailCounts = await getAllCategoryCounts(userId.toString())
      countMap = new Map(
        emailCounts.map(item => [item._id, item.count])
      )
    }

    // Separate default and custom categories
    const defaultCategories = []
    const customCategories = []
    
    for (const category of categories) {
      const categoryData = {
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        count: countMap.get(category.name) || 0,
        color: category.color,
        isDefault: category.isDefault || false,
        isActive: category.isActive,
        classificationStrategy: category.classificationStrategy,
        keywords: category.keywords,
        patterns: category.patterns,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
      
      if (category.isDefault === true) {
        defaultCategories.push(categoryData)
      } else {
        customCategories.push(categoryData)
      }
    }

    // Ensure default categories are in the predefined order
    const defaultOrder = DEFAULT_CATEGORY_NAMES
    
    const sortedDefaultCategories = defaultOrder
      .map(categoryName => defaultCategories.find(cat => cat.name === categoryName))
      .filter(Boolean)

    // Combine: sorted default categories + custom categories at the end
    const categoriesWithCounts = [...sortedDefaultCategories, ...customCategories]

    // Store in cache (without user-specific counts)
    const categoriesWithoutCounts = categoriesWithCounts.map(cat => ({
      ...cat,
      count: 0 // Don't cache user-specific counts
    }))
    categoryCache.set(CACHE_KEY, {
      data: categoriesWithoutCounts,
      timestamp: Date.now()
    })

    console.timeEnd('getCategories-global')
    console.log(`✅ Global categories loaded and cached (${categories.length} categories)`)

    return categoriesWithCounts
  } catch (error) {
    console.error('Error getting categories:', error)
    throw error
  }
}

/**
 * Get category count (global - unique category names only)
 * @returns {Promise<number>} Number of unique active categories
 */
export const getCategoryCount = async () => {
  try {
    // Count distinct category names to avoid duplicates from migration
    // This ensures we only count unique categories, not duplicate documents
    const distinctCategories = await Category.distinct('name', { isActive: true })
    return distinctCategories.length
  } catch (error) {
    console.error('Error getting category count:', error)
    throw error
  }
}

/**
 * Add a new category (global)
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category
 */
export const addCategory = async (categoryData) => {
  try {
    // CRITICAL: Only allow predefined categories
    const categoryName = categoryData.name.trim()
    if (!DEFAULT_CATEGORY_NAMES.includes(categoryName)) {
      throw new Error(`Only predefined categories are allowed: ${DEFAULT_CATEGORY_NAMES.join(', ')}`)
    }

    // Check if category already exists globally
    // Prefer categories without userId (global ones), or get the first one
    let existing = await Category.findOne({ 
      name: categoryName,
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    })
    
    // If no global category found, check for any category with this name
    if (!existing) {
      existing = await Category.findOne({ name: categoryName }).sort({ createdAt: 1 })
    }
    
    if (existing) {
      // Update existing category instead of creating new one
      existing.description = categoryData.description || existing.description
      existing.color = categoryData.color || existing.color
      existing.classificationStrategy = categoryData.classificationStrategy || existing.classificationStrategy
      existing.patterns = categoryData.patterns || existing.patterns
      existing.trainingStatus = categoryData.trainingStatus || existing.trainingStatus
      existing.keywords = categoryData.keywords || existing.keywords
      existing.isActive = true
      // Ensure it's a global category (no userId)
      if (existing.userId) {
        existing.userId = undefined
      }
      
      const savedCategory = await existing.save()
      
      // Clear cache after updating category
      clearCategoryCache()
      
      console.log(`✅ Category "${savedCategory.name}" updated globally`)
      
      return {
        id: savedCategory._id.toString(),
        name: savedCategory.name,
        description: savedCategory.description,
        count: 0,
        color: savedCategory.color,
        isDefault: savedCategory.isDefault,
        isActive: savedCategory.isActive,
        classificationStrategy: savedCategory.classificationStrategy,
        patterns: savedCategory.patterns,
        trainingStatus: savedCategory.trainingStatus,
        mlServiceId: savedCategory.mlServiceId,
        createdAt: savedCategory.createdAt,
        updatedAt: savedCategory.updatedAt
      }
    }

    const newCategory = new Category({
      name: categoryData.name.trim(),
      description: categoryData.description || `Custom category: ${categoryData.name.trim()}`,
      color: categoryData.color || '#6B7280',
      isDefault: false,
      emailCount: 0,
      // Add new fields for dynamic classification
      classificationStrategy: categoryData.classificationStrategy || null,
      patterns: categoryData.patterns || null,
      trainingStatus: categoryData.trainingStatus || 'pending',
      sampleEmailIds: categoryData.sampleEmailIds || [],
      keywords: categoryData.keywords || []
    })

    const savedCategory = await newCategory.save()
    
    // Clear cache after adding category
    clearCategoryCache()
    
    console.log(`✅ Category "${savedCategory.name}" saved globally`)
    
    return {
      id: savedCategory._id.toString(),
      name: savedCategory.name,
      description: savedCategory.description,
      count: 0,
      color: savedCategory.color,
      isDefault: savedCategory.isDefault,
      isActive: savedCategory.isActive,
      classificationStrategy: savedCategory.classificationStrategy,
      patterns: savedCategory.patterns,
      trainingStatus: savedCategory.trainingStatus,
      mlServiceId: savedCategory.mlServiceId,
      createdAt: savedCategory.createdAt,
      updatedAt: savedCategory.updatedAt
    }
  } catch (error) {
    console.error('Error adding category:', error)
    throw error
  }
}

/**
 * Update an existing category (global)
 * @param {string} categoryId - Category ID
 * @param {Object} updates - Updates to apply
 * @param {string} userId - Optional userId for triggering reclassification for that user
 * @returns {Promise<Object|null>} Updated category or null if not found
 */
export const updateCategory = async (categoryId, updates, userId = null) => {
  try {
    if (!categoryId) {
      throw new Error('Category ID is required')
    }

    // Find the category (global, no userId check)
    const category = await Category.findById(categoryId)
    
    if (!category) {
      return null
    }

    // Prevent renaming the "Other" category
    if (category.name === 'Other' && updates.name && updates.name !== category.name) {
      throw new Error('Cannot rename the "Other" category')
    }

    // Check if classification strategy is being updated
    const shouldTriggerReclassification = 
      updates.classificationStrategy && 
      JSON.stringify(updates.classificationStrategy) !== JSON.stringify(category.classificationStrategy)

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        ...updates,
        name: updates.name ? updates.name.trim() : category.name,
        updatedAt: new Date()
      },
      { new: true }
    )

    // Clear cache after updating category
    clearCategoryCache()

    // Trigger reclassification if classification strategy changed (for all users or specific user)
    if (shouldTriggerReclassification && updatedCategory) {
      try {
        console.log(`🔄 Category "${updatedCategory.name}" strategy updated globally - changes apply to all users`)
        // Note: Reclassification would need to be triggered for all users or handled separately
        if (userId) {
          await startReclassificationJob(userId, updatedCategory.name, updatedCategory._id.toString())
        }
      } catch (reclassifyError) {
        console.error('❌ Error starting reclassification for updated category:', reclassifyError)
        // Don't fail the category update if reclassification fails
      }
    }

    return {
      id: updatedCategory._id.toString(),
      name: updatedCategory.name,
      description: updatedCategory.description,
      count: 0,
      color: updatedCategory.color,
      isDefault: updatedCategory.isDefault,
      isActive: updatedCategory.isActive,
      classificationStrategy: updatedCategory.classificationStrategy,
      keywords: updatedCategory.keywords,
      patterns: updatedCategory.patterns,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt
    }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

/**
 * Delete a category (global - affects all users)
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Deleted category or null if not found
 */
export const deleteCategory = async (categoryId) => {
  try {
    if (!categoryId) {
      throw new Error('Category ID is required')
    }

    // Find the category (global)
    const category = await Category.findById(categoryId)
    
    if (!category) {
      return null
    }

    // Prevent deleting default categories (any category with isDefault: true)
    if (category.isDefault === true) {
      throw new Error('Cannot delete default categories. Only custom categories can be deleted.')
    }

    // Move all emails from this category to "Other" for ALL users before deleting
    const emailCount = await Email.countDocuments({ 
      category: category.name 
    })

    if (emailCount > 0) {
      console.log(`🔄 Moving ${emailCount} emails from "${category.name}" to "Other" category globally`)
      
      await Email.updateMany(
        { 
          category: category.name
        },
        { 
          $set: { 
            category: 'Other',
            classification: {
              label: 'Other',
              confidence: 1.0,
              modelVersion: 'manual',
              classifiedAt: new Date(),
              reason: `Moved to Other due to category "${category.name}" deletion`
            },
            updatedAt: new Date()
          }
        }
      )
      
      console.log(`✅ Moved ${emailCount} emails to "Other" category globally`)
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId)
    
    // Clear cache after deleting category
    clearCategoryCache()
    
    return {
      id: deletedCategory._id.toString(),
      name: deletedCategory.name,
      description: deletedCategory.description,
      count: 0,
      color: deletedCategory.color,
      isDefault: deletedCategory.isDefault,
      isActive: deletedCategory.isActive,
      createdAt: deletedCategory.createdAt,
      updatedAt: deletedCategory.updatedAt
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

/**
 * Find category by ID (global)
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Category or null if not found
 */
export const findCategoryById = async (categoryId) => {
  try {
    if (!categoryId) {
      return null
    }

    const category = await Category.findById(categoryId)
    
    if (!category) {
      return null
    }

    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      count: 0,
      color: category.color,
      isDefault: category.isDefault,
      isActive: category.isActive,
      classificationStrategy: category.classificationStrategy,
      keywords: category.keywords,
      patterns: category.patterns,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }
  } catch (error) {
    console.error('Error finding category by ID:', error)
    return null
  }
}

/**
 * Find category by name (global)
 * @param {string} name - Category name
 * @returns {Promise<Object|null>} Category or null if not found
 */
export const findCategoryByName = async (name) => {
  try {
    if (!name) {
      return null
    }

    const category = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isActive: true
    })
    
    if (!category) {
      return null
    }

    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      count: 0,
      color: category.color,
      isDefault: category.isDefault,
      isActive: category.isActive,
      classificationStrategy: category.classificationStrategy,
      keywords: category.keywords,
      patterns: category.patterns,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }
  } catch (error) {
    console.error('Error finding category by name:', error)
    return null
  }
}
