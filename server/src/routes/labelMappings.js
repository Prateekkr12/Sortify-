// Label mapping routes for managing label-to-category mappings
import express from 'express'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import LabelMapping from '../models/LabelMapping.js'
import Category from '../models/Category.js'
import { clearLabelMappingCache } from '../services/labelClassificationService.js'
import { clearCategoryCache } from '../services/categoryService.js'
import mongoose from 'mongoose'

const router = express.Router()

// @desc    Get all label mappings for user
// @route   GET /api/label-mappings
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    
    const mappings = await LabelMapping.find({ userId, isActive: true })
      .sort({ priority: -1, createdAt: 1 })
    
    res.json({
      success: true,
      count: mappings.length,
      mappings
    })
  } catch (error) {
    console.error('Get label mappings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch label mappings',
      error: error.message
    })
  }
}))

// @desc    Get single label mapping by ID
// @route   GET /api/label-mappings/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const mappingId = req.params.id
    
    if (!mongoose.Types.ObjectId.isValid(mappingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mapping ID'
      })
    }
    
    const mapping = await LabelMapping.findOne({ _id: mappingId, userId })
    
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Label mapping not found'
      })
    }
    
    res.json({
      success: true,
      mapping
    })
  } catch (error) {
    console.error('Get label mapping error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch label mapping',
      error: error.message
    })
  }
}))

// @desc    Create new label mapping
// @route   POST /api/label-mappings
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const { label, categoryName, priority = 1, description = '', matchType = 'exact', regexPattern = null } = req.body
    
    // Validate required fields
    if (!label || !categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Label and categoryName are required'
      })
    }
    
    // Validate category exists for this user
    const category = await Category.findOne({ userId, name: categoryName, isActive: true })
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category "${categoryName}" not found for this user`
      })
    }
    
    // Check if mapping already exists
    const existingMapping = await LabelMapping.findOne({ userId, label })
    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message: 'Label mapping already exists for this label'
      })
    }
    
    // Create new mapping
    const mapping = new LabelMapping({
      userId,
      label: label.trim(),
      categoryName: categoryName.trim(),
      priority: Math.min(Math.max(1, priority), 10), // Clamp between 1-10
      description: description.trim(),
      matchType: ['exact', 'contains', 'regex'].includes(matchType) ? matchType : 'exact',
      regexPattern: matchType === 'regex' ? regexPattern : null,
      isActive: true
    })
    
    await mapping.save()
    
    // Clear caches
    clearLabelMappingCache(userId)
    clearCategoryCache(userId)
    
    res.status(201).json({
      success: true,
      message: 'Label mapping created successfully',
      mapping
    })
  } catch (error) {
    console.error('Create label mapping error:', error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Label mapping already exists for this user and label'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create label mapping',
      error: error.message
    })
  }
}))

// @desc    Update label mapping
// @route   PUT /api/label-mappings/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const mappingId = req.params.id
    const { label, categoryName, priority, description, matchType, regexPattern, isActive } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(mappingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mapping ID'
      })
    }
    
    const mapping = await LabelMapping.findOne({ _id: mappingId, userId })
    
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Label mapping not found'
      })
    }
    
    // Validate category if changing
    if (categoryName && categoryName !== mapping.categoryName) {
      const category = await Category.findOne({ userId, name: categoryName, isActive: true })
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category "${categoryName}" not found for this user`
        })
      }
      mapping.categoryName = categoryName.trim()
    }
    
    // Update fields
    if (label !== undefined) mapping.label = label.trim()
    if (priority !== undefined) mapping.priority = Math.min(Math.max(1, priority), 10)
    if (description !== undefined) mapping.description = description.trim()
    if (matchType !== undefined && ['exact', 'contains', 'regex'].includes(matchType)) {
      mapping.matchType = matchType
    }
    if (regexPattern !== undefined) mapping.regexPattern = matchType === 'regex' ? regexPattern : null
    if (isActive !== undefined) mapping.isActive = isActive
    
    await mapping.save()
    
    // Clear caches
    clearLabelMappingCache(userId)
    clearCategoryCache(userId)
    
    res.json({
      success: true,
      message: 'Label mapping updated successfully',
      mapping
    })
  } catch (error) {
    console.error('Update label mapping error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update label mapping',
      error: error.message
    })
  }
}))

// @desc    Delete label mapping
// @route   DELETE /api/label-mappings/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const mappingId = req.params.id
    
    if (!mongoose.Types.ObjectId.isValid(mappingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mapping ID'
      })
    }
    
    const mapping = await LabelMapping.findOne({ _id: mappingId, userId })
    
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Label mapping not found'
      })
    }
    
    await LabelMapping.findByIdAndDelete(mappingId)
    
    // Clear caches
    clearLabelMappingCache(userId)
    clearCategoryCache(userId)
    
    res.json({
      success: true,
      message: 'Label mapping deleted successfully'
    })
  } catch (error) {
    console.error('Delete label mapping error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete label mapping',
      error: error.message
    })
  }
}))

// @desc    Bulk create label mappings
// @route   POST /api/label-mappings/bulk
// @access  Private
router.post('/bulk', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const { mappings } = req.body
    
    if (!mappings || !Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mappings array is required'
      })
    }
    
    // Validate all categories exist
    const categoryNames = [...new Set(mappings.map(m => m.categoryName))]
    const categories = await Category.find({ userId, name: { $in: categoryNames }, isActive: true })
    const validCategoryNames = new Set(categories.map(c => c.name))
    
    const invalidCategories = categoryNames.filter(name => !validCategoryNames.has(name))
    if (invalidCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid categories: ${invalidCategories.join(', ')}`
      })
    }
    
    // Create mappings
    const createdMappings = []
    const errors = []
    
    for (const mappingData of mappings) {
      try {
        const { label, categoryName, priority = 1, description = '', matchType = 'exact', regexPattern = null } = mappingData
        
        // Check if already exists
        const existing = await LabelMapping.findOne({ userId, label })
        if (existing) {
          errors.push({ label, error: 'Mapping already exists' })
          continue
        }
        
        const mapping = new LabelMapping({
          userId,
          label: label.trim(),
          categoryName: categoryName.trim(),
          priority: Math.min(Math.max(1, priority), 10),
          description: description.trim(),
          matchType: ['exact', 'contains', 'regex'].includes(matchType) ? matchType : 'exact',
          regexPattern: matchType === 'regex' ? regexPattern : null,
          isActive: true
        })
        
        await mapping.save()
        createdMappings.push(mapping)
      } catch (error) {
        errors.push({ label: mappingData.label, error: error.message })
      }
    }
    
    // Clear caches
    clearLabelMappingCache(userId)
    clearCategoryCache(userId)
    
    res.status(201).json({
      success: true,
      message: `Created ${createdMappings.length} label mapping(s)`,
      created: createdMappings.length,
      mappings: createdMappings,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Bulk create label mappings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create label mappings',
      error: error.message
    })
  }
}))

export default router

