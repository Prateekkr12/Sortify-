# HOD Classification Fix

## Issue
Emails from HOD (Head of Department) were being incorrectly classified as "Professor" instead of "HOD" category.

Example: `HOD CSE <hod.cse@sharda.ac.in>` was classified as "Professor"

## Root Cause
1. **Priority**: HOD had `priority: 'low'`, meaning it was checked after high-priority categories like Professor
2. **Missing Prioritization**: HOD was not prioritized when sender matched HOD patterns
3. **Missing Exclusions**: HOD senders were not excluded from Professor category
4. **Incomplete Pattern Matching**: HOD sender pattern matching was not comprehensive enough

## Changes Made

### 1. Updated `server/src/config/keywordCategories.js`

#### a) Changed HOD Priority
- Changed from `priority: 'low'` to `priority: 'high'`
- This ensures HOD is checked among high-priority categories

#### b) Enhanced HOD Sender Domains
Added comprehensive HOD domain patterns:
- `hod.cse@sharda.ac.in`, `hod.ece@sharda.ac.in`, `hod.me@sharda.ac.in`
- `hod.ce@sharda.ac.in`, `hod.eee@sharda.ac.in`, `hod.it@sharda.ac.in`
- `hod.ae@sharda.ac.in`, `hod.civil@sharda.ac.in`, `hod.chem@sharda.ac.in`
- `hod.bt@sharda.ac.in`, `hod.biotech@sharda.ac.in`, `hod.mba@sharda.ac.in`
- `hod.law@sharda.ac.in`, `hod.pharmacy@sharda.ac.in`, `hod.medical@sharda.ac.in`
- `hod.nursing@sharda.ac.in`, `hod.physiotherapy@sharda.ac.in`
- And more department variations

#### c) Enhanced HOD Sender Names
Added more HOD name patterns:
- `HOD CSE`, `HOD ECE`, `HOD ME`, `HOD CE`, `HOD EEE`, `HOD IT`, `HOD AE`
- `Head of Department CSE`, `Head of Department ECE`

#### d) Added HOD Exclusions to Professor Category
Added to `excludeNames`:
- `HOD CSE`, `HOD ECE`, `HOD ME`, `HOD CE`, `HOD EEE`, `HOD IT`, `HOD AE`
- `HOD`, `Head of Department`, `Head of Dept`, `Department Head`, `Dept Head`, `HoD`

Added to `excludeDomains`:
- All `hod.xxx@sharda.ac.in` domain patterns

### 2. Updated `server/src/services/keywordClassificationService.js`

#### a) Added HOD Sender Detection
- Detects HOD senders by checking:
  - Sender name contains "HOD", "Head of Department", "Head of Dept"
  - Domain contains "hod." (e.g., `hod.cse@sharda.ac.in`)
  - Full sender string contains HOD patterns

#### b) Smart Priority Sorting
- When HOD sender is detected, HOD category is checked BEFORE Professor
- Priority order when HOD sender detected:
  1. HOD (checked first)
  2. Other high-priority categories
  3. Normal-priority categories
  4. Low-priority categories

#### c) Enhanced Sorting Logic
```javascript
const isHODSender = fromLower.includes('hod cse') || 
                   fromLower.includes('hod ') ||
                   domainLower.includes('hod.') ||
                   fromLower.includes('head of department') ||
                   fromLower.includes('head of dept')

// Prioritize HOD before Professor when HOD sender detected
if (isHODSender) {
  if (a.name === 'HOD' && b.name !== 'HOD') return -1
  if (a.name !== 'HOD' && b.name === 'HOD') return 1
}
// Check HOD before Professor
if (a.name === 'HOD' && b.name === 'Professor') return -1
if (a.name === 'Professor' && b.name === 'HOD') return 1
```

### 3. Updated `server/src/services/phase1ClassificationService.js`

- Added the same HOD sender detection and priority sorting logic
- Ensures consistency across both classification phases

### 4. Updated `server/src/utils/senderPatternMatcher.js`

#### Enhanced HOD-Specific Pattern Matching
- Improved HOD detection to catch:
  - HOD email domains: `hod.xxx@sharda.ac.in` patterns
  - HOD in sender names: "HOD CSE", "HOD ECE", etc.
  - "Head of Department" or "Head of Dept" in sender
- Confidence: 0.98 for domain matches, 0.95 for name matches

## Expected Behavior After Fix

1. **Emails from HOD senders** (e.g., `HOD CSE <hod.cse@sharda.ac.in>`) will:
   - Be checked against "HOD" category FIRST (before Professor)
   - Be excluded from "Professor" category
   - Return immediately if high-confidence sender match found (≥90%)

2. **Classification Priority Order** (when sender matches HOD patterns):
   1. HOD (checked first)
   2. Other high-priority categories
   3. Normal-priority categories
   4. Low-priority categories

3. **Professor Category** will continue to match:
   - Specific professor names (e.g., "Dr. Nishant Gupta")
   - "Assistant Professor", "Associate Professor"
   - "SU Manager", "Manager" (if added to keywords)
   - Faculty-related senders that are NOT HOD

## Testing

To verify the fix works:
1. Check emails from: `HOD CSE <hod.cse@sharda.ac.in>`
2. Check emails with subjects like: "Re: Regarding End Semester Examination"
3. These should now be classified as "HOD" instead of "Professor"

## Files Modified

1. `server/src/config/keywordCategories.js`
2. `server/src/services/keywordClassificationService.js`
3. `server/src/services/phase1ClassificationService.js`
4. `server/src/utils/senderPatternMatcher.js`

## Date
December 13, 2025

