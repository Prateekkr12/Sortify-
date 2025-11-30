import mongoose from 'mongoose'
import Email from '../models/Email.js'

// Migration script to add provider field to existing emails
const migrateEmailProvider = async () => {
  try {
    console.log('🔄 Starting email provider migration...')
    
    // Find emails without provider field or with null provider
    const emailsToUpdate = await Email.find({
      $or: [
        { provider: { $exists: false } },
        { provider: null }
      ]
    })
    
    console.log(`📧 Found ${emailsToUpdate.length} emails to migrate`)
    
    if (emailsToUpdate.length === 0) {
      console.log('✅ No emails need migration')
      return
    }
    
    // Update emails to set provider as 'gmail' (since they have gmailId)
    const result = await Email.updateMany(
      {
        $or: [
          { provider: { $exists: false } },
          { provider: null }
        ],
        gmailId: { $exists: true } // Only update emails that have gmailId
      },
      { 
        $set: { provider: 'gmail' }
      }
    )
    
    console.log(`✅ Migration completed: ${result.modifiedCount} emails updated`)
    
    // Also update emails without gmailId but with messageId (legacy emails)
    const legacyResult = await Email.updateMany(
      {
        $or: [
          { provider: { $exists: false } },
          { provider: null }
        ],
        gmailId: { $exists: false },
        messageId: { $exists: true }
      },
      { 
        $set: { provider: 'gmail' }
      }
    )
    
    console.log(`✅ Legacy emails updated: ${legacyResult.modifiedCount} emails`)
    
    console.log(`🎉 Total emails migrated: ${result.modifiedCount + legacyResult.modifiedCount}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sortify'
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('🔌 Connected to MongoDB')
      return migrateEmailProvider()
    })
    .then(() => {
      console.log('✅ Migration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

export default migrateEmailProvider
