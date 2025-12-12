"""
Extract and update keywords from NPTEL emails
"""

import re
import json
from collections import Counter
from typing import List, Set, Dict

# NPTEL emails provided by user
EMAILS = [
    {
        "subject": "NPTEL Newsletter: Digital Transformation Strategy – Leadership Essentials : Strategize. Transform. Lead from IITM",
        "from": "NPTEL <onlinecourses@nptel.iitm.ac.in>",
        "to": "newsletter-announce@nptel.iitm.ac.in",
        "date": "12/12/2025, 4:34:07 PM",
        "body": "Thanks and Regards, NPTEL TEAM. -- To unsubscribe from this group and stop receiving emails from it: Log in to Google Groups and click on My Groups seen in the left navigation pane. You will see the list of your groups. Choose the group \"NPTEL Newsletter\" Click the Leave Group icon on the right side to leave the group or you can choose the \"No email\" option under Subscription to stop receiving these emails. To unsubscribe from this group and stop receiving emails from it, send an email to newsletter-announce+unsubscribe@nptel.iitm.ac.in."
    },
    {
        "subject": "Welcome to NPTEL Online Course : Leadership and Team Effectiveness",
        "from": "onlinecourses@nptel.iitm.ac.in",
        "to": "2022003695.prateek@ug.sharda.ac.in",
        "date": "12/11/2025, 7:22:01 PM",
        "body": """Dear Learner

Welcome to SWAYAM-NPTEL Online Courses and Certification!

Thank you for signing up for our online course "Leadership and Team Effectiveness". We wish you an enjoyable and informative learning experience.

Details regarding the course:
Name of the course: Leadership and Team Effectiveness 
Course url: https://onlinecourses.nptel.ac.in/noc26_mg61/preview
Course duration : 12 weeks 

The course will begin on 19 January 2026 When content is released on the portal, you will get an email alerting you.

CONTENT AND ASSIGNMENTS

Every week, about 2.5 to 4 hours of videos containing content by the Course instructor will be released along with an assignment based on this. Please watch the lectures, follow the course regularly and submit all assessments and assignments before the due date. Your regular participation is vital for learning and doing well in the course. This will be done week on week through the duration of the course.
Please do the assignments yourself and even if you take help, kindly try to learn from it. These assignment will help you prepare for the final exams. Plagiarism and violating the Honor code will be taken very seriously if detected during the submission of assignments.

ANNOUNCEMENT AND DISCUSSION GROUPS TO CLEAR DOUBTS:

The announcement group - will only have messages from course instructors and teaching assistants - regarding the lessons, assignments, exam registration, hall tickets etc.
The discussion forum (Ask a question tab on the portal) - is for everyone to ask questions and interact.Anyone who knows the answers can reply to anyone's post and the course instructor/TA will also respond to your queries. Please make maximum use of this feature as this will help you learn much better.
If you have any questions regarding the exam, registration, hall tickets, results, queries related to the technical content in the lectures, any doubts in the assignments, etc can be posted in the forum section

TO GET A CERTIFICATE - PROCESS AND CRITERIA:
The course is free to enroll and learn from. But if you want a certificate, you have to register and write the proctored exam conducted by us in person at any of the designated exam centres.
The exam is optional for a fee of Rs 1000/- (Rupees one thousand only).
Date and Time of Exams: 19 April 2026 Morning session 9am to 12 noon; Afternoon Session 2pm to 5pm.
Registration url: Announcements will be made when the registration form is open for registrations.
The online registration form has to be filled and the certification exam fee needs to be paid. More details will be made available when the exam registration form is published. If there are any changes, it will be mentioned then.
Please check the form for more details on the cities where the exams will be held, the conditions you agree to when you fill the form etc.

CRITERIA TO GET A CERTIFICATE

Average assignment score = 25% of average of best 8 assignments out of the total 12 assignments given in the course.
Exam score = 75% of the proctored certification exam score out of 100

Final score = Average assignment score + Exam score

YOU WILL BE ELIGIBLE FOR A CERTIFICATE ONLY IF AVERAGE ASSIGNMENT SCORE >=10/25 AND EXAM SCORE >= 30/75. If one of the 2 criteria is not met, you will not get the certificate even if the Final score >= 40/100.

Certificate will have your name, photograph and the score in the final exam with the breakup.It will have the logos of NPTEL and IIT Roorkee. It will be e-verifiable at nptel.ac.in/noc.

Only the e-certificate will be made available. Hard copies will not be dispatched.

Once again, thanks for your interest in our online courses and certification. Happy learning.

- NPTEL team"""
    },
    {
        "subject": "NPTEL Newsletter: Only 2 days to go! Accelerate your EV journey with IITM's EVEND program",
        "from": "NPTEL <onlinecourses@nptel.iitm.ac.in>",
        "to": "newsletter-announce@nptel.iitm.ac.in",
        "date": "12/10/2025, 2:33:06 PM",
        "body": "Thanks and Regards, NPTEL TEAM. -- To unsubscribe from this group and stop receiving emails from it: Log in to Google Groups and click on My Groups seen in the left navigation pane. You will see the list of your groups. Choose the group \"NPTEL Newsletter\" Click the Leave Group icon on the right side to leave the group or you can choose the \"No email\" option under Subscription to stop receiving these emails. To unsubscribe from this group and stop receiving emails from it, send an email to newsletter-announce+unsubscribe@nptel.iitm.ac.in."
    },
    {
        "subject": "NPTEL Newsletter: IITM eMobility: Stepping into Cohort 8 with 500+ Certified Professionals!",
        "from": "NPTEL <onlinecourses@nptel.iitm.ac.in>",
        "to": "newsletter-announce@nptel.iitm.ac.in",
        "date": "11/26/2025, 10:35:13 AM",
        "body": "Thanks and Regards, NPTEL TEAM. -- To unsubscribe from this group and stop receiving emails from it: Log in to Google Groups and click on My Groups seen in the left navigation pane. You will see the list of your groups. Choose the group \"NPTEL Newsletter\" Click the Leave Group icon on the right side to leave the group or you can choose the \"No email\" option under Subscription to stop receiving these emails. To unsubscribe from this group and stop receiving emails from it, send an email to newsletter-announce+unsubscribe@nptel.iitm.ac.in."
    }
]

# Common stopwords to filter out
STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'his', 'her', 'its', 'our', 'their', 'him', 'them', 'me', 'us',
    'if', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
    'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're',
    've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn',
    'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn',
    'wasn', 'weren', 'won', 'wouldn'
}

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    # Remove URLs
    text = re.sub(r'https?://[^\s]+', '', text)
    # Remove special characters but keep spaces
    text = re.sub(r'[^\w\s-]', ' ', text)
    # Convert to lowercase
    text = text.lower()
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_keywords(text: str, min_length: int = 3) -> List[str]:
    """Extract keywords from text"""
    text = clean_text(text)
    words = re.findall(r'\b[a-z]{' + str(min_length) + r',}\b', text)
    keywords = [w for w in words if w not in STOPWORDS and len(w) >= min_length]
    return keywords

def extract_phrases(text: str, min_words: int = 2, max_words: int = 4) -> List[str]:
    """Extract meaningful phrases from text"""
    text = clean_text(text)
    sentences = re.split(r'[.!?\n]', text)
    phrases = []
    
    for sentence in sentences:
        words = re.findall(r'\b[a-z]{3,}\b', sentence)
        words = [w for w in words if w not in STOPWORDS]
        
        # Extract n-grams
        for n in range(min_words, min(max_words + 1, len(words) + 1)):
            for i in range(len(words) - n + 1):
                phrase = ' '.join(words[i:i+n])
                if len(phrase) > 5:  # Minimum phrase length
                    phrases.append(phrase)
    
    return phrases

def extract_course_topics(subject: str, body: str) -> List[str]:
    """Extract course topics and specific terms"""
    full_text = f"{subject} {body}".lower()
    
    # Extract course names (between quotes or after colons)
    course_names = re.findall(r'[:\"]\s*([A-Z][^:\.\"\n]{5,50})', full_text)
    
    # Extract program names (EVEND, SCMPro, etc.)
    program_names = re.findall(r'\b([A-Z]{2,}(?:-[A-Z]+)?)\b', full_text)
    
    # Extract IIT names
    iit_names = re.findall(r'\b(iit\s+\w+)\b', full_text)
    
    return course_names + program_names + iit_names

def analyze_emails() -> Dict:
    """Analyze all emails and extract keywords"""
    all_keywords = []
    all_phrases = []
    all_subjects = []
    all_topics = []
    
    for email in EMAILS:
        subject = email.get('subject', '')
        body = email.get('body', '')
        full_text = f"{subject} {body}"
        
        # Extract keywords
        keywords = extract_keywords(full_text)
        all_keywords.extend(keywords)
        
        # Extract phrases
        phrases = extract_phrases(full_text)
        all_phrases.extend(phrases)
        
        # Collect subjects for analysis
        all_subjects.append(subject)
        
        # Extract specific topics
        topics = extract_course_topics(subject, body)
        all_topics.extend(topics)
    
    # Count frequencies
    keyword_counts = Counter(all_keywords)
    phrase_counts = Counter(all_phrases)
    
    # Filter by frequency (appears in at least 1 email)
    significant_keywords = {k: v for k, v in keyword_counts.items() if v >= 1}
    significant_phrases = {p: v for p, v in phrase_counts.items() if v >= 1}
    
    # Extract important terms from subjects
    subject_keywords = []
    for subject in all_subjects:
        # Extract important capitalized phrases
        important_phrases = re.findall(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', subject)
        subject_keywords.extend([p.lower() for p in important_phrases])
    
    return {
        'keywords': significant_keywords,
        'phrases': significant_phrases,
        'subject_keywords': Counter(subject_keywords),
        'topics': list(set([t.lower() for t in all_topics if t]))
    }

def categorize_keywords(keyword_data: Dict) -> Dict:
    """Categorize keywords into primary, secondary, and phrases"""
    
    # Read existing keywords to avoid duplicates
    try:
        with open('server/src/config/keywordCategories.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract existing NPTEL keywords
        nptel_section = re.search(r"'NPTEL':\s*\{[^}]*?primaryKeywords:\s*\[(.*?)\],\s*secondaryKeywords:\s*\[(.*?)\],\s*phrases:\s*\[(.*?)\],", content, re.DOTALL)
        
        existing_primary = set(re.findall(r"'([^']+)'", nptel_section.group(1) if nptel_section else ''))
        existing_secondary = set(re.findall(r"'([^']+)'", nptel_section.group(2) if nptel_section else ''))
        existing_phrases = set(re.findall(r"'([^']+)'", nptel_section.group(3) if nptel_section else ''))
    except:
        existing_primary = set()
        existing_secondary = set()
        existing_phrases = set()
    
    all_existing = existing_primary | existing_secondary | {p.lower() for p in existing_phrases}
    
    # New keywords from emails
    new_keywords = set(keyword_data['keywords'].keys())
    new_phrases = set(keyword_data['phrases'].keys())
    
    # Filter out existing keywords
    unique_keywords = new_keywords - all_existing
    unique_phrases = {p for p in new_phrases if p.lower() not in {e.lower() for e in existing_phrases}}
    
    # Identify high-value keywords (appear multiple times or in subject)
    high_value_keywords = {
        k for k, v in keyword_data['keywords'].items() 
        if k in unique_keywords and (v >= 2 or k in keyword_data['subject_keywords'])
    }
    
    # Primary keywords: high frequency, NPTEL-specific terms
    primary_candidates = set()
    for kw in unique_keywords:
        if any(term in kw for term in ['nptel', 'course', 'exam', 'certificate', 'registration', 'assignment', 'lecture', 'iit', 'swayam']):
            primary_candidates.add(kw)
    
    primary_keywords = high_value_keywords | primary_candidates
    
    # Secondary keywords: remaining unique keywords
    secondary_keywords = unique_keywords - primary_keywords
    
    # Important phrases from subjects
    important_phrases = set()
    for phrase, count in keyword_data['subject_keywords'].items():
        if phrase.lower() not in {p.lower() for p in existing_phrases}:
            important_phrases.add(phrase.lower())
    
    # Extract course-specific phrases
    course_phrases = {
        'digital transformation strategy',
        'leadership essentials',
        'leadership and team effectiveness',
        'ev journey',
        'evend program',
        'iitm emobility',
        'cohort 8',
        'certified professionals'
    }
    
    # Add meaningful phrases
    meaningful_phrases = {p for p in unique_phrases if len(p.split()) >= 2 and len(p) > 8}
    
    new_phrases_list = sorted(important_phrases | meaningful_phrases | course_phrases)
    
    return {
        'primary': sorted(primary_keywords),
        'secondary': sorted(secondary_keywords),
        'phrases': new_phrases_list,
        'topics': keyword_data['topics']
    }

def generate_report() -> Dict:
    """Generate keyword extraction report"""
    print("Analyzing NPTEL emails...")
    keyword_data = analyze_emails()
    
    print("Categorizing keywords...")
    categorized = categorize_keywords(keyword_data)
    
    report = {
        'extracted_keywords': {
            'primary': categorized['primary'],
            'secondary': categorized['secondary'],
            'phrases': categorized['phrases'],
            'topics': categorized['topics']
        },
        'statistics': {
            'total_emails': len(EMAILS),
            'unique_primary': len(categorized['primary']),
            'unique_secondary': len(categorized['secondary']),
            'unique_phrases': len(categorized['phrases']),
            'topics_found': len(categorized['topics'])
        }
    }
    
    # Save report
    with open('nptel_keywords_extracted.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\nExtracted {len(categorized['primary'])} primary keywords")
    print(f"Extracted {len(categorized['secondary'])} secondary keywords")
    print(f"Extracted {len(categorized['phrases'])} phrases")
    print(f"Found {len(categorized['topics'])} topics")
    print("\nReport saved to nptel_keywords_extracted.json")
    
    return report

if __name__ == "__main__":
    report = generate_report()
    
    print("\n" + "="*60)
    print("KEYWORD EXTRACTION SUMMARY")
    print("="*60)
    print(f"\nPrimary Keywords ({len(report['extracted_keywords']['primary'])}):")
    for kw in report['extracted_keywords']['primary'][:20]:  # Show first 20
        print(f"  - {kw}")
    if len(report['extracted_keywords']['primary']) > 20:
        print(f"  ... and {len(report['extracted_keywords']['primary']) - 20} more")
    
    print(f"\nImportant Phrases ({len(report['extracted_keywords']['phrases'])}):")
    for phrase in report['extracted_keywords']['phrases'][:20]:  # Show first 20
        print(f"  - {phrase}")
    if len(report['extracted_keywords']['phrases']) > 20:
        print(f"  ... and {len(report['extracted_keywords']['phrases']) - 20} more")
    
    if report['extracted_keywords']['topics']:
        print(f"\nTopics Found:")
        for topic in report['extracted_keywords']['topics']:
            print(f"  - {topic}")

