// Notification routes for push notifications and email alerts
import express from 'express'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import notificationService from '../services/notificationService.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const { type, limit = 50, offset = 0 } = req.query

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    const userIdString = userId.toString()
    console.log('Fetching notifications for user:', userIdString)
    
    // Optimized: Single query to get all non-archived notifications
    // Use lean() for better performance and convert to plain objects
    let allNotifications = await Notification.find({
      userId: userIdString,
      archived: false
    })
    .sort({ timestamp: -1 })
    .lean() // Use lean() for better performance
    .limit(parseInt(limit) + parseInt(offset)) // Limit query results
    
    console.log('Found notifications for user:', allNotifications.length)

    // If no notifications, create welcome notification asynchronously (don't wait)
    if (allNotifications.length === 0) {
      // Check for welcome notification in background (non-blocking)
      Notification.findOne({
        userId: userIdString,
        title: 'Welcome to Sortify',
        'data.welcome': true
      })
      .lean()
      .then(existingWelcome => {
        if (!existingWelcome) {
          // Create welcome notification asynchronously
          notificationService.sendPushNotification(userIdString, {
            type: 'system',
            title: 'Welcome to Sortify',
            message: 'Your notification center is ready! You\'ll receive updates about your email management here.',
            data: { welcome: true }
          }).catch(err => {
            console.error('Error creating welcome notification:', err)
            // Don't throw - this is non-critical
          })
        }
      })
      .catch(err => {
        console.error('Error checking for welcome notification:', err)
        // Don't throw - this is non-critical
      })
    }

    // Apply type filter if specified
    let notifications = allNotifications
    if (type) {
      notifications = notifications.filter(n => n.type === type)
    }

    // Apply pagination
    const paginatedNotifications = notifications.slice(parseInt(offset), parseInt(offset) + parseInt(limit))

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length

    console.log(`Returning ${paginatedNotifications.length} notifications (${unreadCount} unread) for user ${userIdString}`)

    // Always return success with data (even if empty)
    res.json({
      success: true,
      notifications: paginatedNotifications,
      total: notifications.length,
      unread: unreadCount
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    console.error('Error stack:', error.stack)
    
    // Return empty array on error instead of failing completely
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
      notifications: [], // Return empty array so UI doesn't break
      total: 0,
      unread: 0
    })
  }
}))

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userIdString = userId.toString()

    console.log('Mark as read request:', { id, userId, userIdString })

    // Find notification in database - use string userId consistently
    let notification = await Notification.findOne({
      id: id,
      userId: userIdString,  // Use string version consistently
      archived: false
    })

    // If not found by exact match, try finding by ID only and update userId if needed
    if (!notification) {
      notification = await Notification.findOne({
        id: id,
        archived: false
      })
      
      if (notification && notification.userId !== userIdString) {
        console.log('Updating notification userId to match current user for mark as read operation')
        await Notification.findByIdAndUpdate(notification._id, {
          $set: { userId: userIdString }
        })
        notification.userId = userIdString
      }
    }

    // Last fallback: if still not found, try to find the most recent unread notification for this user
    if (!notification) {
      console.log('Notification not found by ID, checking for user unread notifications')
      notification = await Notification.findOne({
        userId: userIdString,  // Use string version consistently
        archived: false,
        read: false
      }).sort({ timestamp: -1 })
      
      if (notification) {
        console.log('Found unread notification as fallback:', notification.title)
      }
    }

    if (!notification) {
      const availableNotifications = await Notification.find({
        userId: userIdString  // Use string version consistently
      }).select('id userId title read archived').limit(10)
      
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        debug: {
          requestedId: id,
          requestedUserId: userIdString,
          availableNotifications: availableNotifications.map(n => ({
            id: n.id,
            userId: n.userId,
            title: n.title,
            read: n.read,
            archived: n.archived
          }))
        }
      })
    }

    // Update notification in database
    const updatedNotification = await Notification.findByIdAndUpdate(
      notification._id,
      {
        $set: {
          read: true,
          readAt: new Date().toISOString()
        }
      },
      { new: true }
    )

    console.log('Notification marked as read in database:', {
      id: updatedNotification.id,
      userId: updatedNotification.userId,
      read: updatedNotification.read
    })

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification: updatedNotification.toObject()
    })

  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    })
  }
}))

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const userIdString = userId.toString()

    // Mark all user notifications as read in database (only non-archived ones)
    const result = await Notification.updateMany(
      {
        userId: userIdString,  // Use string version consistently
        read: false,
        archived: false
      },
      {
        $set: {
          read: true,
          readAt: new Date().toISOString()
        }
      }
    )

    console.log('Marked notifications as read in database:', {
      userId: userIdString,
      modifiedCount: result.modifiedCount
    })

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount
    })

  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    })
  }
}))

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userIdString = userId.toString()

    const notification = await Notification.findOne({
      id: id,
      userId: userIdString,  // Use string version consistently
      archived: false
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    // Mark as archived instead of deleting
    await Notification.findByIdAndUpdate(notification._id, {
      $set: {
        archived: true,
        archivedAt: new Date().toISOString()
      }
    })

    console.log('Notification archived in database:', {
      id: notification.id,
      userId: notification.userId
    })

    res.json({
      success: true,
      message: 'Notification archived'
    })

  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    })
  }
}))

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
router.delete('/clear-all', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const userIdString = userId.toString()

    // Mark all user notifications as archived in database instead of deleting them
    const result = await Notification.updateMany(
      {
        userId: userIdString,  // Use string version consistently
        archived: false
      },
      {
        $set: {
          archived: true,
          archivedAt: new Date().toISOString()
        }
      }
    )

    console.log('Archived all notifications in database:', {
      userId: userIdString,
      modifiedCount: result.modifiedCount
    })

    res.json({
      success: true,
      message: `Archived ${result.modifiedCount} notifications`,
      count: result.modifiedCount
    })

  } catch (error) {
    console.error('Clear all notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to clear all notifications',
      error: error.message
    })
  }
}))

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
router.get('/preferences', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        preferences: {
          pushNotifications: true,
          emailAlerts: false,
          notificationTypes: ['new_email', 'classification', 'bulk_operation', 'sync_status', 'email_operation', 'profile_update', 'connection', 'category_management', 'performance', 'system', 'refinement_summary'],
          quietHours: { start: '22:00', end: '08:00' }
        }
      })
    }

    const preferences = notificationService.getUserPreferences(userId)

    res.json({
      success: true,
      preferences
    })

  } catch (error) {
    console.error('Get notification preferences error:', error)
    // Return default preferences on error instead of failing
    res.json({
      success: true, // Still return success with defaults
      preferences: {
        pushNotifications: true,
        emailAlerts: false,
        notificationTypes: ['new_email', 'classification', 'bulk_operation', 'sync_status', 'email_operation', 'profile_update', 'connection', 'category_management', 'performance', 'system', 'refinement_summary'],
        quietHours: { start: '22:00', end: '08:00' }
      }
    })
  }
}))

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
router.put('/preferences', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const preferences = req.body

    // Validate preferences - include all valid notification types
    const validTypes = [
      'new_email', 
      'classification', 
      'bulk_operation', 
      'sync_status',
      'email_operation',
      'profile_update',
      'connection',
      'category_management',
      'performance',
      'system',
      'login',
      'auth',
      'refinement_summary',
      'info',
      'test'
    ]
    
    if (preferences.notificationTypes && Array.isArray(preferences.notificationTypes)) {
      const invalidTypes = preferences.notificationTypes.filter(type => !validTypes.includes(type))
      if (invalidTypes.length > 0) {
        console.warn('Invalid notification types received:', invalidTypes)
        // Don't fail - just filter out invalid types
        preferences.notificationTypes = preferences.notificationTypes.filter(type => validTypes.includes(type))
      }
    }

    notificationService.setUserPreferences(userId, preferences)
    const updatedPreferences = notificationService.getUserPreferences(userId)

    res.json({
      success: true,
      message: 'Notification preferences updated',
      preferences: updatedPreferences
    })

  } catch (error) {
    console.error('Update notification preferences error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    })
  }
}))

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
router.post('/test', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const { type = 'test', title, message } = req.body

    const notification = await notificationService.sendPushNotification(userId, {
      type,
      title: title || 'Test Notification',
      message: message || 'This is a test notification from Sortify',
      data: { test: true }
    })

    res.json({
      success: true,
      message: 'Test notification sent',
      notification
    })

  } catch (error) {
    console.error('Send test notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    })
  }
}))

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const stats = notificationService.getNotificationStats(userId)

    res.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get notification stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    })
  }
}))

// @desc    Schedule notification
// @route   POST /api/notifications/schedule
// @access  Private
router.post('/schedule', protect, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id
    const { notification, scheduleTime } = req.body

    if (!notification || !scheduleTime) {
      return res.status(400).json({
        success: false,
        message: 'Notification and scheduleTime are required'
      })
    }

    const scheduleId = notificationService.scheduleNotification(userId, notification, scheduleTime)

    res.json({
      success: true,
      message: 'Notification scheduled',
      scheduleId
    })

  } catch (error) {
    console.error('Schedule notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to schedule notification',
      error: error.message
    })
  }
}))

// @desc    Cancel scheduled notification
// @route   DELETE /api/notifications/schedule/:scheduleId
// @access  Private
router.delete('/schedule/:scheduleId', protect, asyncHandler(async (req, res) => {
  try {
    const { scheduleId } = req.params

    const cancelled = notificationService.cancelScheduledNotification(scheduleId)

    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled notification not found'
      })
    }

    res.json({
      success: true,
      message: 'Scheduled notification cancelled'
    })

  } catch (error) {
    console.error('Cancel scheduled notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled notification',
      error: error.message
    })
  }
}))

export default router
