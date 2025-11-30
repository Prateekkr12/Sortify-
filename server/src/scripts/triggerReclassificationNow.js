/**
 * Quick script to trigger reclassification for a specific user
 * Usage: node server/src/scripts/triggerReclassificationNow.js [userId]
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { reclassifyAllEmailsWithRuleBased } from '../services/emailReclassificationService.js'

// Load environment variables
dotenv.config({ path: '../.env' })
dotenv.config({ path: './.env' })
dotenv.config({ path: '../../.env' })

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sortify'
    console.log('📊 Connecting to MongoDB...')
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    console.log('✅ Connected to MongoDB successfully')
    console.log(`   Host: ${mongoose.connection.host}`)
    console.log(`   Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('   Tried URI:', process.env.MONGO_URI ? `${process.env.MONGO_URI.substring(0, 30)}...` : 'NOT SET')
    process.exit(1)
  }
}

const main = async () => {
  try {
    // Connect to database FIRST
    await connectDB()
    
    // Get userId from command line or use default
    const userId = process.argv[2] || '68eab61a651a6b52f39547de'
    
    console.log('\n🚀 Starting Rule-Based Email Reclassification')
    console.log('='.repeat(60))
    console.log(`📌 Target User: ${userId}`)
    console.log('⚙️  Configuration:')
    console.log('   - Preserve Manual Categorizations: Yes')
    console.log('   - Batch Size: 100 emails')
    console.log('   - Classification: Rule-Based (Label + Keyword)')
    console.log('\n🔄 Starting reclassification...\n')
    
    const startTime = Date.now()
    
    // Run reclassification
    const result = await reclassifyAllEmailsWithRuleBased(userId, {
      preserveManual: true,
      batchSize: 100
    })
    
    const duration = Math.floor((Date.now() - startTime) / 1000)
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 RECLASSIFICATION COMPLETE')
    console.log('='.repeat(60))
    console.log(`✅ Success: ${result.success}`)
    console.log(`📧 Total Emails: ${result.statistics.totalEmails}`)
    console.log(`✅ Processed: ${result.statistics.processedEmails}`)
    console.log(`🔄 Reclassified: ${result.statistics.reclassifiedEmails}`)
    console.log(`⏭️  Skipped (Manual): ${result.statistics.skippedManualEmails}`)
    console.log(`⏭️  Skipped (Same): ${result.statistics.skippedSameCategory}`)
    console.log(`❌ Errors: ${result.statistics.errorCount}`)
    
    if (Object.keys(result.statistics.categoryChanges || {}).length > 0) {
      console.log('\n📋 Category Changes:')
      Object.keys(result.statistics.categoryChanges).forEach(oldCat => {
        Object.keys(result.statistics.categoryChanges[oldCat]).forEach(newCat => {
          const count = result.statistics.categoryChanges[oldCat][newCat]
          console.log(`   ${oldCat} → ${newCat}: ${count} emails`)
        })
      })
    }
    
    const formatDuration = (seconds) => {
      if (seconds < 60) return `${seconds}s`
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
    }
    
    console.log(`\n⏱️  Total Duration: ${formatDuration(duration)}`)
    console.log('✅ Reclassification completed successfully!')
    console.log('\n')
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('📊 Database connection closed')
    process.exit(0)
  }
}

main()

