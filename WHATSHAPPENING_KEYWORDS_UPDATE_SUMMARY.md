# What's Happening Keywords Update Summary

## Date: December 13, 2025

### Emails Analyzed: 3

1. **HR Department is organizing Christmas & New Year Carnival 2025 on 19th Dec 2025 for the Students, Faculty, and Employees**
   - From: 'What's Happening' via Batch 2022-2023 <batch2022-2023@ug.sharda.ac.in>
   - Date: 12/12/2025

2. **Fire Safety Awareness Workshop**
   - From: 'What's Happening' via UG Student Group <ug.group@ug.sharda.ac.in>
   - Date: 12/11/2025

3. **Two-Day UP Scholarship Helpdesk & Awareness Camp (11th–12th December 2025)**
   - From: 'What's Happening' via Batch 2022-2023 <batch2022-2023@ug.sharda.ac.in>
   - Date: 12/10/2025

---

## New Keywords Added

### Primary Keywords (20 new)
- `carnival`
- `christmas`
- `scholarship`
- `helpdesk`
- `advisor`
- `convener`
- `coordinator`
- `registrar`
- `speaker`
- `employees`
- `faculty`
- `students`
- `stalls`
- `games`
- `food`
- `shopping`
- `activities`
- `performances`
- `department`
- `december`
- `friday`

### Secondary Keywords (12 new)
- `fire safety`
- `awareness workshop`
- `awareness camp`
- `up scholarship`
- `hr department`
- `human resource department`
- `dean students welfare`
- `ncc unit`
- `ncc cadets`
- `armed forces flag day`
- `campus safety`
- `fire prevention`
- `emergency response`
- `emergency handling`
- `sharda hospital`
- `shardacare healthcity`
- `medical wing`

### New Phrases (45+ new)

**Event-Specific:**
- `christmas & new year carnival`
- `fire safety awareness workshop`
- `two-day up scholarship helpdesk`
- `scholarship helpdesk & awareness camp`
- `up scholarship`

**Safety & Awareness:**
- `fire safety equipment`
- `fire extinguishers`
- `safe evacuation`
- `emergency response`
- `emergency handling`
- `campus safety`

**Scholarship-Related:**
- `scholarship application`
- `fresh application`
- `renewal application`
- `form filling`
- `document verification`
- `eligibility checks`
- `technical assistance`
- `domicile certificate`
- `category certificate`
- `income certificate`
- `aadhaar card`
- `bank passbook`
- `attendance sheet`
- `exam cell`
- `nodal officer`

**Organizational:**
- `hr department organizing`
- `human resource department`
- `dean students welfare`
- `dsw office`
- `ncc unit organizing`
- `armed forces flag day`
- `chief human resources officer`
- `learning & development`

**Event Activities:**
- `stall bookings`
- `first-come first-serve`
- `team building`
- `cross-department interaction`
- `employee & student participation`
- `sparking joy`
- `create enjoyable memories`
- `art and craft`

**Venues:**
- `sports ground`
- `opposite mandela hostel`
- `block 4 ground`
- `lawn in front of block-3`

**Dates:**
- `19th dec 2025`
- `12th december 2025`
- `11th & 12th december 2025`

---

## Updated Files

1. **server/src/config/keywordCategories.js**
   - Added 20 new primary keywords
   - Added 12 new secondary keywords
   - Added 45+ new phrases
   - Updated senderDomains to include:
     - `batch2022-2023@ug.sharda.ac.in`
     - `ug.group@ug.sharda.ac.in`
   - Updated senderNames to include:
     - `'What's Happening' via Batch`
     - `'What's Happening' via UG Student Group`
     - `Batch 2022-2023`
     - `UG Student Group`

---

## Statistics

- **Existing Keywords:**
  - Primary: 32
  - Secondary: 66
  - Phrases: 14

- **New Keywords Added:**
  - Primary: 20
  - Secondary: 12
  - Phrases: 45+

- **Updated Totals:**
  - Primary: 52
  - Secondary: 78
  - Phrases: 59+

---

## Event Types Identified

1. **Carnivals & Celebrations:**
   - Christmas & New Year Carnival
   - Fun-filled events with performances, stalls, games

2. **Safety & Awareness Workshops:**
   - Fire Safety Awareness Workshop
   - Emergency response training
   - Campus safety initiatives

3. **Scholarship Programs:**
   - UP Scholarship Helpdesk
   - Scholarship application assistance
   - Document verification camps

4. **Departmental Events:**
   - HR Department events
   - NCC Unit activities
   - DSW (Dean Students' Welfare) programs

---

## Key Features Extracted

### Event Characteristics
- Team building activities
- Cross-department interaction
- Employee & student participation
- Fun-filled events
- Awareness programs

### Organizational Roles
- Advisor, Convener, Coordinator
- Registrar, Chief Human Resources Officer
- NCC Officers (ANO, SGT, CPL)
- Nodal Officers

### Venues Identified
- Sports Ground
- Mandela Hostel area
- Block 4 Ground
- Block-3 Lawn

---

## Next Steps

To add more keywords from future emails:
1. Add new email content to `extract_whatshappening_keywords.py`
2. Run: `python extract_whatshappening_keywords.py`
3. Review the generated JSON file
4. Update `server/src/config/keywordCategories.js` with new keywords

---

## Notes

- All keywords are case-insensitive
- Duplicates were automatically filtered out
- Keywords are organized by relevance (primary > secondary > phrases)
- The extraction focused on event-specific terminology, safety programs, and scholarship assistance
- Sender patterns have been updated to catch emails from Batch groups and UG Student Group

