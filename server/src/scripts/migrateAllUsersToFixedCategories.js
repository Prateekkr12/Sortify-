/**
 * Migration Script: Ensure All Users Have Fixed Categories
 * 
 * This script safely migrates all users to ensure they have the 9 fixed categories.
 * It does NOT delete custom categories or modify email.category field values.
 * 
 * Usage:
 *   node server/src/scripts/migrateAllUsersToFixedCategories.js [--dry-run] [--user-id=USER_ID]
 * 
 * Options:
 *   --dry-run    Show what would change without making changes
 *   --user-id    Migrate only a specific user (useful for testing)
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category, { DEFAULT_CATEGORIES, DEFAULT_CATEGORY_NAMES } from '../models/Category.js'
import User from '../models/User.js'

// Load environment variables
dotenv.config()

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Migrate categories for a specific user
 * @param {ObjectId} userId - User ID
 * @param {boolean} dryRun - If true, don't make changes
 * @returns {Promise<Object>} Migration result
 */
const migrateUserCategories = async (userId, dryRun = false) => {
  const result = {
    userId: userId.toString(),
    categoriesBefore: [],
    categoriesAfter: [],
    created: [],
    updated: [],
    customCategories: [],
    errors: []
  }

  try {
    // Get existing categories
    const existingCategories = await Category.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      isActive: true 
    })

    result.categoriesBefore = existingCategories.map(cat => ({
      name: cat.name,
      isDefault: cat.isDefault,
      description: cat.description,
      color: cat.color
    }))

    // Separate default and custom categories
    const existingCategoryMap = new Map()
    existingCategories.forEach(cat => {
      existingCategoryMap.set(cat.name, cat)
      if (!DEFAULT_CATEGORY_NAMES.includes(cat.name)) {
        result.customCategories.push({
          name: cat.name,
          emailCount: cat.emailCount || 0
        })
      }
    })

    // Process each default category (excluding "All" which is virtual)
    const defaultCategories = DEFAULT_CATEGORIES.filter(cat => cat.name !== 'All')

    for (const defaultCategory of defaultCategories) {
      const existingCategory = existingCategoryMap.get(defaultCategory.name)

      if (!existingCategory) {
        // Category missing - would create it
        result.created.push({
          name: defaultCategory.name,
          description: defaultCategory.description,
          color: defaultCategory.color,
          priority: defaultCategory.priority
        })

        if (!dryRun) {
          const newCategory = new Category({
            userId: new mongoose.Types.ObjectId(userId),
            name: defaultCategory.name,
            description: defaultCategory.description,
            color: defaultCategory.color,
            isDefault: true,
            priority: defaultCategory.priority || 'normal',
            isActive: true,
            emailCount: 0,
            trainingStatus: 'completed'
          })

          try {
            await newCategory.save()
            console.log(`  ✅ Created category "${defaultCategory.name}" for user ${userId}`)
          } catch (saveError) {
            if (saveError.code === 11000) {
              // Race condition - category was created by another process
              console.log(`  ⚠️ Category "${defaultCategory.name}" already exists (race condition)`)
            } else {
              throw saveError
            }
          }
        }
      } else {
        // Category exists - check if metadata needs update
        const needsUpdate = 
          existingCategory.description !== defaultCategory.description ||
          existingCategory.color !== defaultCategory.color ||
          existingCategory.priority !== defaultCategory.priority ||
          existingCategory.isDefault !== true ||
          existingCategory.isActive !== true

        if (needsUpdate) {
          result.updated.push({
            name: defaultCategory.name,
            changes: {
              description: existingCategory.description !== defaultCategory.description,
              color: existingCategory.color !== defaultCategory.color,
              priority: existingCategory.priority !== defaultCategory.priority,
              isDefault: existingCategory.isDefault !== true,
              isActive: existingCategory.isActive !== true
            },
            old: {
              description: existingCategory.description,
              color: existingCategory.color,
              priority: existingCategory.priority,
              isDefault: existingCategory.isDefault,
              isActive: existingCategory.isActive
            },
            new: {
              description: defaultCategory.description,
              color: defaultCategory.color,
              priority: defaultCategory.priority,
              isDefault: true,
              isActive: true
            }
          })

          if (!dryRun) {
            // Update only metadata fields, preserve classification data
            existingCategory.description = defaultCategory.description
            existingCategory.color = defaultCategory.color
            existingCategory.priority = defaultCategory.priority
            existingCategory.isDefault = true
            existingCategory.isActive = true
            await existingCategory.save()
            console.log(`  ✅ Updated metadata for category "${defaultCategory.name}" for user ${userId}`)
          }
        }
      }
    }

    // Get categories after migration
    if (!dryRun) {
      const afterCategories = await Category.find({ 
        userId: new mongoose.Types.ObjectId(userId), 
        isActive: true 
      })
      result.categoriesAfter = afterCategories.map(cat => ({
        name: cat.name,
        isDefault: cat.isDefault,
        description: cat.description,
        color: cat.color
      }))
    }

    return result

  } catch (error) {
    result.errors.push({
      message: error.message,
      stack: error.stack
    })
    console.error(`  ❌ Error migrating user ${userId}:`, error.message)
    return result
  }
}

/**
 * Main migration function
 */
const runMigration = async () => {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const userIdArg = args.find(arg => arg.startsWith('--user-id='))
  const specificUserId = userIdArg ? userIdArg.split('=')[1] : null

  console.log('\n' + '='.repeat(60))
  console.log('🔧 Category Migration Script')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be saved)'}`)
  if (specificUserId) {
    console.log(`Target: Single user (${specificUserId})`)
  } else {
    console.log('Target: All users')
  }
  console.log('='.repeat(60) + '\n')

  await connectDB()

  try {
    let users
    if (specificUserId) {
      const user = await User.findById(specificUserId)
      if (!user) {
        console.error(`❌ User ${specificUserId} not found`)
        process.exit(1)
      }
      users = [user]
    } else {
      users = await User.find({})
    }

    console.log(`📊 Found ${users.length} user(s) to migrate\n`)

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      console.log(`\n🔄 Processing user: ${user._id} (${user.email || 'no email'})`)
      const result = await migrateUserCategories(user._id, dryRun)
      results.push(result)

      if (result.errors.length === 0) {
        successCount++
        console.log(`  ✅ Success: ${result.created.length} created, ${result.updated.length} updated`)
        if (result.customCategories.length > 0) {
          console.log(`  ℹ️  Custom categories preserved: ${result.customCategories.map(c => c.name).join(', ')}`)
        }
      } else {
        errorCount++
        console.log(`  ❌ Failed with ${result.errors.length} error(s)`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Migration Summary')
    console.log('='.repeat(60))
    console.log(`Total users processed: ${users.length}`)
    console.log(`Successful: ${successCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`\nMode: ${dryRun ? 'DRY RUN (no changes were made)' : 'LIVE (changes were saved)'}`)
    
    if (dryRun) {
      const totalCreated = results.reduce((sum, r) => sum + r.created.length, 0)
      const totalUpdated = results.reduce((sum, r) => sum + r.updated.length, 0)
      console.log(`\nWould create ${totalCreated} categories`)
      console.log(`Would update ${totalUpdated} categories`)
    } else {
      const totalCreated = results.reduce((sum, r) => sum + r.created.length, 0)
      const totalUpdated = results.reduce((sum, r) => sum + r.updated.length, 0)
      console.log(`\nCreated ${totalCreated} categories`)
      console.log(`Updated ${totalUpdated} categories`)
    }

    const totalCustom = results.reduce((sum, r) => sum + r.customCategories.length, 0)
    if (totalCustom > 0) {
      console.log(`\n⚠️  ${totalCustom} custom category/categories preserved across all users`)
      console.log('   (Custom categories were NOT deleted or modified)')
    }

    console.log('='.repeat(60) + '\n')

    // Exit
    process.exit(errorCount > 0 ? 1 : 0)

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error)
    process.exit(1)
  }
}

// Run migration
runMigration()

