import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import ModernIcon from './ModernIcon'
import { api } from '../services/api'
import { useWebSocketContext } from '../contexts/WebSocketContext'
import { getCategoryColor } from '../utils/categoryColors'

const CategoryTabs = ({ value, onChange, refreshTrigger }) => {
  const [categories, setCategories] = useState([{ id: 'All', label: 'All', color: '#64748b' }])
  const [loading, setLoading] = useState(true)
  const { lastMessage } = useWebSocketContext()


  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/realtime/categories')
      
      if (response.data && response.data.categories) {
        // Server already returns categories in correct order (defaults first, then custom)
        // Separate default and custom categories
        const defaultCategories = []
        const customCategories = []
        
        response.data.categories.forEach(category => {
          const categoryData = {
            id: category.name,
            label: category.name,
            color: getCategoryColor(category.name, 'hex'),
            isDefault: category.isDefault || false
          }
          
          if (category.isDefault) {
            defaultCategories.push(categoryData)
          } else {
            customCategories.push(categoryData)
          }
        })
        
        // Always include "All" at the beginning
        const allCategory = { id: 'All', label: 'All', color: '#64748b' }
        
        // Server already returns in correct order, but ensure "Other" is last among defaults
        const otherIndex = defaultCategories.findIndex(cat => cat.id === 'Other')
        let otherCategory
        let defaultCategoriesWithoutOther = defaultCategories
        
        if (otherIndex >= 0) {
          otherCategory = defaultCategories[otherIndex]
          defaultCategoriesWithoutOther = defaultCategories.filter(cat => cat.id !== 'Other')
        } else {
          // Create "Other" category if it doesn't exist (fallback)
          otherCategory = { id: 'Other', label: 'Other', color: '#64748b', isDefault: true }
        }
        
        // Final order: All, default categories (Other last), then custom categories
        const finalCategories = [allCategory, ...defaultCategoriesWithoutOther, otherCategory, ...customCategories]
        setCategories(finalCategories)
        console.log('✅ Categories loaded dynamically:', finalCategories)
      } else {
        console.warn('⚠️ No categories data received, using fallback')
        // Fallback: Use the 9 fixed categories
        setCategories([
          { id: 'All', label: 'All', color: '#64748b' },
          { id: 'Placement', label: 'Placement', color: '#3B82F6' },
          { id: 'NPTEL', label: 'NPTEL', color: '#8B5CF6' },
          { id: 'HOD', label: 'HOD', color: '#EF4444' },
          { id: 'E-Zone', label: 'E-Zone', color: '#10B981' },
          { id: 'Promotions', label: 'Promotions', color: '#F59E0B' },
          { id: 'Whats happening', label: 'Whats happening', color: '#EC4899' },
          { id: 'Professor', label: 'Professor', color: '#6366F1' },
          { id: 'Other', label: 'Other', color: '#6B7280' }
        ])
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      // Use fallback categories (the 9 fixed categories)
      setCategories([
        { id: 'All', label: 'All', color: '#64748b' },
        { id: 'Placement', label: 'Placement', color: '#3B82F6' },
        { id: 'NPTEL', label: 'NPTEL', color: '#8B5CF6' },
        { id: 'HOD', label: 'HOD', color: '#EF4444' },
        { id: 'E-Zone', label: 'E-Zone', color: '#10B981' },
        { id: 'Promotions', label: 'Promotions', color: '#F59E0B' },
        { id: 'Whats happening', label: 'Whats happening', color: '#EC4899' },
        { id: 'Professor', label: 'Professor', color: '#6366F1' },
        { id: 'Other', label: 'Other', color: '#6B7280' }
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Refresh categories when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      console.log('🔄 CategoryTabs: Refreshing categories due to trigger')
      fetchCategories()
    }
  }, [refreshTrigger, fetchCategories])

  // Handle real-time category updates from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'category_updated') {
      console.log('🔄 CategoryTabs: Received WebSocket category update:', lastMessage.data)
      const { type, category } = lastMessage.data
      
      switch (type) {
        case 'category_added':
          console.log('➕ Adding category via WebSocket:', category.name)
          setCategories(prev => {
            const newCategory = {
              id: category.name,
              label: category.name,
              color: getCategoryColor(category.name, 'hex')
            }
            // Add new category before "Other" if it exists
            const otherIndex = prev.findIndex(cat => cat.id === 'Other')
            if (otherIndex >= 0) {
              return [...prev.slice(0, otherIndex), newCategory, ...prev.slice(otherIndex)]
            }
            return [...prev, newCategory]
          })
          break
        case 'category_updated':
          console.log('✏️ Updating category via WebSocket:', category.name)
          setCategories(prev => 
            prev.map(cat => 
              cat.id === category.name || cat.label === category.name
                ? { ...cat, label: category.name, id: category.name }
                : cat
            )
          )
          break
        case 'category_deleted':
          console.log('❌ Deleting category via WebSocket:', category.name)
          setCategories(prev => prev.filter(cat => cat.id !== category.name && cat.label !== category.name))
          break
        default:
          // Fallback: if we get any category update, refresh the entire list
          console.log('🔄 CategoryTabs: Fallback refresh due to category update')
          fetchCategories()
          break
      }
    }
  }, [lastMessage, fetchCategories])

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3 mb-8 relative z-15">
        <div className="animate-pulse">
          <div className="h-8 w-16 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8 relative z-15">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`
            px-3 py-1.5 text-xs font-normal transition-all duration-200
            border border-slate-200 rounded-full
            ${
              value === category.id
                ? 'text-slate-800 border-slate-400 bg-slate-50'
                : 'text-slate-600 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50/50'
            }
          `}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {category.label}
        </motion.button>
      ))}
    </div>
  )
}

export default CategoryTabs
