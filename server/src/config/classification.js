// Classification configuration for rule-based system (label + keyword)
export const CLASSIFICATION_CONFIG = {
  // Legacy phase1 config (for backward compatibility)
  phase1: {
    enabled: true,
    confidenceThreshold: 0.70,
    fallbackCategory: 'Other',
    senderDomainConfidence: 0.95,
    senderNameConfidence: 0.90,
    keywordConfidence: 0.75,
    defaultConfidence: 0.30
  },
  // New rule-based classification configuration
  ruleBased: {
    enabled: true,
    fallbackCategory: 'Other',
    // Confidence levels for different classification methods
    labelConfidence: 0.95,              // Label-based classification (highest confidence)
    senderDomainConfidence: 0.90,       // Sender domain matches
    senderNameConfidence: 0.90,         // Sender name matches
    specificSenderConfidence: 0.95,     // Specific sender pattern matches
    keywordMinimumConfidence: 0.75,     // Minimum confidence for keyword matches
    keywordOptimalConfidence: 0.85,     // Optimal confidence threshold for keyword matches
    phraseMatchBoost: 0.10,             // Additional confidence boost for phrase matches
    defaultConfidence: 0.30,            // Fallback confidence for "Other"
    // Priority order for classification
    priorityOrder: ['label', 'sender', 'keyword', 'fallback']
  },
  // Legacy phase2 config (deprecated, kept for compatibility)
  phase2: {
    enabled: false, // Disabled - using rule-based only
    delay: 5000,
    batchSize: 20,
    concurrency: 5,
    confidenceImprovementThreshold: 0.15,
    maxRetries: 3,
    batchDelayMs: 100
  }
}

export default CLASSIFICATION_CONFIG

