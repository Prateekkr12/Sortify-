# Subject Keyword Priority Classification

## Feature
Added highest-priority subject line matching: If an email subject contains the category name keyword, classify to that category immediately, before checking any other patterns (sender, body, etc.).

## Implementation

### Priority Order
1. **PRIORITY 0 (Highest)**: Subject contains category name keyword
2. Priority 1: Sender patterns
3. Priority 2: Keyword/phrase matching in body

### Category Name Keywords

Each category name maps to its keyword variations for subject matching:

| Category Name | Subject Keywords |
|--------------|------------------|
| HOD | `hod` |
| NPTEL | `nptel` |
| Professor | `professor` |
| Placement | `placement` |
| Promotions | `promotions`, `promotion` |
| Whats happening | `what's happening`, `whats happening` |
| E-Zone | `e-zone`, `ezone` |
| Other | (skipped - too generic) |

### Matching Logic

- Uses **word boundary matching** (`\b`) to match whole words only
- Case-insensitive matching
- Returns immediately with **0.98 confidence** (very high)
- Checked **before** all other classification methods

### Examples

1. **Subject: "HOD Notice about Exam Schedule"**
   - Contains "HOD" → Classified as **HOD** immediately
   - Confidence: 0.98
   - Method: `subject-category-keyword`

2. **Subject: "NPTEL Course Registration Open"**
   - Contains "NPTEL" → Classified as **NPTEL** immediately
   - Confidence: 0.98

3. **Subject: "Professor Evaluation Schedule"**
   - Contains "Professor" → Classified as **Professor** immediately
   - Confidence: 0.98

4. **Subject: "Re: Regarding End Semester Examination"**
   - No category keyword in subject → Continue with normal classification flow
   - Check sender patterns, then keyword matching

## Code Changes

### 1. `server/src/services/keywordClassificationService.js`

Added `subjectContainsCategoryKeyword()` function and priority check:

```javascript
// PRIORITY 0: Check if subject contains category name keyword (HIGHEST PRIORITY)
for (const category of categories) {
  if (subjectContainsCategoryKeyword(subject, category.name)) {
    // Return immediately with high confidence
    return {
      label: category.name,
      confidence: 0.98,
      method: 'subject-category-keyword',
      matchedPattern: `Subject contains "${category.name}" keyword`,
      matchedValue: subject
    }
  }
}
```

### 2. `server/src/services/phase1ClassificationService.js`

Added the same priority check for Phase 1 classification:

```javascript
// PRIORITY 0: Check if subject contains category name keyword (HIGHEST PRIORITY)
for (const category of categories) {
  if (subjectContainsCategoryKeyword(subject, category.name)) {
    // Return immediately with high confidence
    return {
      label: category.name,
      confidence: 0.98,
      method: 'phase1-subject-category-keyword',
      phase: 1
    }
  }
}
```

## Benefits

1. **Faster Classification**: Immediate return when category is explicit in subject
2. **Higher Accuracy**: Subject line is the most reliable indicator of category
3. **User Intent**: If user puts category name in subject, respect that intent
4. **Reduced False Positives**: Avoids misclassification when category name is explicitly mentioned

## Edge Cases Handled

1. **Word Boundary Matching**: Prevents partial matches
   - "department" won't match "HOD" 
   - "hod.cse@sharda.ac.in" in subject will match "HOD"

2. **Case Insensitive**: Works regardless of case
   - "HOD", "hod", "Hod" all match

3. **Multiple Categories**: First matching category wins (check in order)

4. **Exclusions**: Still respects category exclusions before returning

## Testing

To verify this works:

1. **Test HOD**: Subject with "HOD" → Should classify as HOD
2. **Test NPTEL**: Subject with "NPTEL" → Should classify as NPTEL  
3. **Test Professor**: Subject with "Professor" → Should classify as Professor
4. **Test Without Keyword**: Subject without category keyword → Should use normal classification

## Files Modified

1. `server/src/services/keywordClassificationService.js`
2. `server/src/services/phase1ClassificationService.js`

## Date
December 13, 2025

