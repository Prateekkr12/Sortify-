"""
Refined keyword extraction from NPTEL emails
Focuses on domain-specific, meaningful terms
"""

import re
import json
from typing import List, Set, Dict

# NPTEL emails provided by user
EMAILS = [
    {
        "subject": "NPTEL Newsletter: Digital Transformation Strategy – Leadership Essentials : Strategize. Transform. Lead from IITM",
        "from": "NPTEL <onlinecourses@nptel.iitm.ac.in>",
        "to": "newsletter-announce@nptel.iitm.ac.in",
        "date": "12/12/2025, 4:34:07 PM",
        "body": "Thanks and Regards, NPTEL TEAM."
    },
    {
        "subject": "Welcome to NPTEL Online Course : Leadership and Team Effectiveness",
        "from": "onlinecourses@nptel.iitm.ac.in",
        "body": """Welcome to SWAYAM-NPTEL Online Courses and Certification!
Thank you for signing up for our online course "Leadership and Team Effectiveness".
Course duration : 12 weeks 
The course will begin on 19 January 2026
Every week, about 2.5 to 4 hours of videos containing content by the Course instructor will be released along with an assignment based on this.
Please watch the lectures, follow the course regularly and submit all assessments and assignments before the due date.
ANNOUNCEMENT AND DISCUSSION GROUPS TO CLEAR DOUBTS:
The announcement group - will only have messages from course instructors and teaching assistants - regarding the lessons, assignments, exam registration, hall tickets etc.
The discussion forum (Ask a question tab on the portal) - is for everyone to ask questions and interact.
TO GET A CERTIFICATE - PROCESS AND CRITERIA:
The course is free to enroll and learn from. But if you want a certificate, you have to register and write the proctored exam conducted by us in person at any of the designated exam centres.
The exam is optional for a fee of Rs 1000/- (Rupees one thousand only).
Date and Time of Exams: 19 April 2026 Morning session 9am to 12 noon; Afternoon Session 2pm to 5pm.
CRITERIA TO GET A CERTIFICATE
Average assignment score = 25% of average of best 8 assignments out of the total 12 assignments given in the course.
Exam score = 75% of the proctored certification exam score out of 100
Final score = Average assignment score + Exam score
YOU WILL BE ELIGIBLE FOR A CERTIFICATE ONLY IF AVERAGE ASSIGNMENT SCORE >=10/25 AND EXAM SCORE >= 30/75.
Certificate will have your name, photograph and the score in the final exam with the breakup.It will have the logos of NPTEL and IIT Roorkee. It will be e-verifiable at nptel.ac.in/noc.
Only the e-certificate will be made available. Hard copies will not be dispatched."""
    },
    {
        "subject": "NPTEL Newsletter: Only 2 days to go! Accelerate your EV journey with IITM's EVEND program",
        "from": "NPTEL <onlinecourses@nptel.iitm.ac.in>",
        "body": ""
    },
    {
        "subject": "NPTEL Newsletter: IITM eMobility: Stepping into Cohort 8 with 500+ Certified Professionals!",
        "from": "NPTEL <onlinecourses@nptel.iitm.ac.in>",
        "body": ""
    }
]

def extract_course_names_and_topics(subjects: List[str], bodies: List[str]) -> List[str]:
    """Extract course names and program names from emails"""
    topics = set()
    
    full_text = ' '.join(subjects + bodies)
    
    # Extract course names (capitalized phrases)
    course_patterns = [
        r'(?:course|program|newsletter)[:\s]+([A-Z][a-zA-Z\s&–-]+?)(?:[:]|\s+from|\s+with|$)',
        r'([A-Z][a-zA-Z\s&–-]{10,60}?)(?:\s+from\s+IIT|\s+–|\s+:)',
    ]
    
    for pattern in course_patterns:
        matches = re.findall(pattern, full_text)
        for match in matches:
            cleaned = match.strip()
            if len(cleaned) > 5 and len(cleaned) < 80:
                topics.add(cleaned)
    
    # Specific program names
    programs = re.findall(r'\b([A-Z]{2,}(?:-[A-Z]+)?)\s+program', full_text, re.IGNORECASE)
    topics.update([p.lower() for p in programs])
    
    # IIT names
    iit_names = re.findall(r'\bIIT\s+([A-Z][a-z]+)', full_text)
    topics.update([f'iit {name.lower()}' for name in iit_names])
    
    return sorted(list(topics))

def extract_key_phrases(text: str) -> Set[str]:
    """Extract meaningful key phrases from text"""
    phrases = set()
    
    # Course-related phrases
    course_phrases = [
        r'(?:course|program)\s+(?:duration|will begin|starts?)\s+on\s+(\d+\s+\w+\s+\d+)',
        r'(\d+\s+weeks?)',
        r'(\d+\.?\d*\s+to\s+\d+\.?\d*\s+hours?\s+of\s+videos?)',
        r'(morning\s+session\s+\d+am\s+to\s+\d+\s+noon)',
        r'(afternoon\s+session\s+\d+pm\s+to\s+\d+pm)',
        r'(proctored\s+exam)',
        r'(exam\s+centre[s]?)',
        r'(certification\s+exam)',
        r'(average\s+assignment\s+score)',
        r'(exam\s+score)',
        r'(final\s+score)',
        r'(hall\s+ticket[s]?)',
        r'(e-?certificate)',
        r'(digital\s+certificate)',
        r'(verified\s+certificate)',
        r'(best\s+\d+\s+assignments)',
        r'(discussion\s+forum)',
        r'(teaching\s+assistant[s]?)',
        r'(course\s+instructor[s]?)',
        r'(announcement\s+group)',
        r'(exam\s+registration)',
        r'(exam\s+date)',
        r'(course\s+completion)',
        r'(online\s+courses?\s+and?\s+certification)',
        r'(swayam[-\s]?nptel)',
    ]
    
    for pattern in course_phrases:
        matches = re.findall(pattern, text, re.IGNORECASE)
        phrases.update([m.lower().strip() for m in matches if len(m) > 3])
    
    # Subject-specific phrases
    subject_phrases = re.findall(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', ' '.join([e['subject'] for e in EMAILS]))
    phrases.update([p.lower() for p in subject_phrases if len(p) > 5 and len(p) < 60])
    
    return phrases

def extract_keywords_from_content() -> Dict:
    """Extract meaningful keywords from email content"""
    
    subjects = [e['subject'] for e in EMAILS]
    bodies = [e['body'] for e in EMAILS if e.get('body')]
    full_text = ' '.join(subjects + bodies).lower()
    
    # NPTEL-specific keywords
    nptel_keywords = {
        # Course-related
        'leadership and team effectiveness',
        'digital transformation strategy',
        'leadership essentials',
        'ev journey',
        'evend',
        'emobility',
        'cohort',
        'certified professionals',
        
        # Process-related
        'proctored exam',
        'exam registration',
        'hall ticket',
        'exam centre',
        'exam date',
        'morning session',
        'afternoon session',
        'assignment score',
        'final score',
        'best 8 assignments',
        'average assignment score',
        'exam score',
        'certificate criteria',
        'passing criteria',
        
        # Platform-related
        'swayam nptel',
        'online courses and certification',
        'discussion forum',
        'announcement group',
        'teaching assistant',
        'course instructor',
        'ask a question',
        
        # Certificate-related
        'e-certificate',
        'digital certificate',
        'verified certificate',
        'course completion certificate',
        'hard copies',
        'e-verifiable',
        
        # Institutional
        'iit roorkee',
        'iitm',
        'iit madras',
        
        # Course structure
        'course duration',
        'weeks',
        'hours of videos',
        'weekly assignment',
        'assignment submission',
        'due date',
        
        # Newsletter
        'nptel newsletter',
        'newsletter announce',
    }
    
    # Extract additional phrases
    additional_phrases = extract_key_phrases(' '.join(subjects + bodies))
    nptel_keywords.update(additional_phrases)
    
    # Extract course names and topics
    topics = extract_course_names_and_topics(subjects, bodies)
    
    # Separate into primary keywords and phrases
    primary_keywords = []
    phrases = []
    
    for item in sorted(nptel_keywords):
        words = item.split()
        if len(words) == 1 and len(item) >= 4:
            primary_keywords.append(item)
        elif len(words) >= 2:
            phrases.append(item)
        else:
            primary_keywords.append(item)
    
    return {
        'primary_keywords': sorted(set(primary_keywords)),
        'phrases': sorted(set(phrases)),
        'topics': topics
    }

def check_existing_keywords() -> Dict[str, Set[str]]:
    """Read existing keywords from keywordCategories.js"""
    try:
        with open('server/src/config/keywordCategories.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract NPTEL section
        nptel_match = re.search(
            r"'NPTEL':\s*\{[^}]*?primaryKeywords:\s*\[(.*?)\],\s*secondaryKeywords:\s*\[(.*?)\],\s*phrases:\s*\[(.*?)\],",
            content,
            re.DOTALL
        )
        
        if nptel_match:
            existing_primary = set(re.findall(r"'([^']+)'", nptel_match.group(1)))
            existing_secondary = set(re.findall(r"'([^']+)'", nptel_match.group(2)))
            existing_phrases = set(re.findall(r"'([^']+)'", nptel_match.group(3)))
            
            return {
                'primary': existing_primary,
                'secondary': existing_secondary,
                'phrases': existing_phrases
            }
    except Exception as e:
        print(f"Error reading existing keywords: {e}")
    
    return {'primary': set(), 'secondary': set(), 'phrases': set()}

def main():
    """Main extraction function"""
    print("Extracting keywords from NPTEL emails...")
    
    # Extract new keywords
    extracted = extract_keywords_from_content()
    
    # Get existing keywords
    existing = check_existing_keywords()
    all_existing = existing['primary'] | existing['secondary'] | {p.lower() for p in existing['phrases']}
    
    # Filter out existing keywords
    new_primary = [kw for kw in extracted['primary_keywords'] if kw.lower() not in all_existing]
    new_phrases = [ph for ph in extracted['phrases'] if ph.lower() not in {e.lower() for e in existing['phrases']}]
    
    # Prepare report
    report = {
        'extraction_date': '2025-01-21',
        'emails_analyzed': len(EMAILS),
        'new_keywords': {
            'primary_keywords': new_primary,
            'phrases': new_phrases,
            'topics': extracted['topics']
        },
        'statistics': {
            'new_primary_keywords': len(new_primary),
            'new_phrases': len(new_phrases),
            'new_topics': len(extracted['topics'])
        },
        'existing_keywords_count': {
            'primary': len(existing['primary']),
            'secondary': len(existing['secondary']),
            'phrases': len(existing['phrases'])
        }
    }
    
    # Save report
    with open('nptel_keywords_refined.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print("KEYWORD EXTRACTION COMPLETE")
    print(f"{'='*60}")
    print(f"\nNew Primary Keywords: {len(new_primary)}")
    for kw in new_primary[:15]:
        print(f"  - {kw}")
    if len(new_primary) > 15:
        print(f"  ... and {len(new_primary) - 15} more")
    
    print(f"\nNew Phrases: {len(new_phrases)}")
    for phrase in new_phrases[:15]:
        print(f"  - {phrase}")
    if len(new_phrases) > 15:
        print(f"  ... and {len(new_phrases) - 15} more")
    
    if extracted['topics']:
        print(f"\nTopics Found: {len(extracted['topics'])}")
        for topic in extracted['topics']:
            print(f"  - {topic}")
    
    print(f"\nReport saved to nptel_keywords_refined.json")
    
    return report

if __name__ == "__main__":
    main()

