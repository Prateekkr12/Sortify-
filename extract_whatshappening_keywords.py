"""
Extract keywords from What's Happening emails
"""

import re
import json
from typing import List, Set, Dict
from datetime import datetime

# What's Happening emails provided by user
EMAILS = [
    {
        "subject": "HR Department is organizing Christmas & New Year Carnival 2025 on 19th Dec 2025 for the Students, Faculty, and Employees",
        "from": "'What's Happening' via Batch 2022-2023 <batch2022-2023@ug.sharda.ac.in>",
        "body": """Dear All,
Namaste!
The Human Resource Department is organizing a Christmas & New Year Carnival 2025 for the Students, Faculty and Employees of Sharda Hospital, ShardaCare Healthcity & Sharda University. It is going to be a fun-filled event with performances from students and employees, along with stalls in the areas of Food, Games, Art and Craft, Activities, and Shopping. The stalls for the event will be allocated on a First-Come, First-Serve basis to employees and students at a nominal booking amount of 3000/- rupees only.

Objective of Events:
Sparking Joy and Excitement
Team Building & Connection
Encourages Employee & Student participation
Create Enjoyable Memories
Encourage Cross-Department Interaction

Advisor Details:
Dr. Vivek Kumar Gupta, Registrar, Sharda University
Mr. Amit Toppo, Chief Human Resources Officer, Sharda University (Medical Wing)

Convener Details:
Ms Sazia Madar, Senior Manager, Learning & Development- Human Resources, ShardaCare Healthcity & Sharda Hospital
Ms Priyanka Goel – Manager, Human Resources, Sharda University

Coordinator Details for Stall Bookings:
Ms. Anju Singh, HR Department, Sharda Hospital, ShardaCare HealthCity & Sharda University (Medical Wing) - 9205586063
Ms. Moxada Mishra, HR Department, Sharda University, 9205586070

Program Details:
Date: 19th Dec 2025, Friday
Time: 12:00 PM - 5:00 PM
Venue: Sports Ground, Opposite Mandela Hostel, Sharda University"""
    },
    {
        "subject": "Fire Safety Awareness Workshop",
        "from": "'What's Happening' via UG Student Group <ug.group@ug.sharda.ac.in>",
        "body": """Dear All,
Sharda University, in collaboration with the NCC Unit, is organizing a Fire Safety Awareness Workshop on Friday, 12th December, with active participation from NCC cadets and students. This initiative aims to promote campus safety, strengthen awareness about fire prevention, and prepare students to act responsibly during emergencies.

This workshop will introduce students to essential fire safety practices, emergency handling methods, and the correct use of fire safety equipment. It also encourages confidence, alertness, and readiness among participants during unforeseen situations.

Additionally, this event is being conducted on behalf of the Armed Forces Flag Day, observed on 7th December, to honor the bravery and sacrifices of our armed forces personnel.

Objective of Events:
To create awareness about fire hazards and prevention measures.
To educate students on the basic use of fire extinguishers and safety tools.
To train participants on safe evacuation and emergency response.
To promote a responsible and safety-conscious environment on campus.

Convener Details:
Lt. (Dr.) Yashodhara Raj ANO, NCC

Co-Ordinator Details:
SGT Sneha Chechi
CPL Preeti Pal
CPL Nandini

Speakers Details:
Mr. Satyaprakash Tripathi

Program Details:
Date: 12 Dec 2025 - 12 Dec 2025
Time: 3:00 PM - 4:00 PM
Venue: Block 4 Ground, Sharda University"""
    },
    {
        "subject": "Two-Day UP Scholarship Helpdesk & Awareness Camp (11th–12th December 2025)",
        "from": "'What's Happening' via Batch 2022-2023 <batch2022-2023@ug.sharda.ac.in>",
        "body": """Dear All,
Sharda University's Office of the Dean, Students' Welfare (DSW) is organizing a Two-Day UP Scholarship Helpdesk & Awareness Camp to assist students applying for the UP Scholarship (2025–26). The camp will provide support for Fresh & Renewal applications, including form filling, document verification, eligibility checks, and technical assistance, ensuring smooth and error-free submission.

Event Details:
Dates: 11th & 12th December 2025
Time: 10:00 AM – 04:00 PM
Venue: Lawn, In Front of Block-3, Sharda University, Greater Noida

All eligible students are strongly encouraged to participate and complete their scholarship applications with support from the DSW Team.

Eligibility Criteria:
General Eligibility
Passed 10th examination from any recognized board (UP Board/CBSE/ICSE/Sanskrit Board, etc.).
Permanent resident of Uttar Pradesh with a valid Domicile Certificate (issued by Tahsildar; not older than 5 years).
Must possess an Aadhaar Card showing a valid Uttar Pradesh address.
OBC/SC/ST students must have a Category Certificate issued in their own name by the Tahsildar.
Family Annual Income Limit:
General/OBC/Minority: Up to ₹2,00,000
SC/ST: Up to ₹2,50,000
(Income Certificate must be in the name of father/mother and not older than 3 years.)

Other eligibility for Undergraduate (UG) Courses
Minimum 75% attendance in the academic year 2025–26.
Must not have received a UG scholarship previously (for Fresh applicants).
Minimum marks in 12th:
General/OBC: 60%
SC/ST/Minority: 50%
For Lateral Entry (Diploma to UG): Provide Diploma Marksheet and meet general eligibility conditions.

Other eligibility for Postgraduate (PG) Courses
Minimum 75% attendance in the academic year 2025–26.
Must not have received a PG scholarship previously.
Minimum marks in Graduation:
General/OBC/Minority: 55%
SC/ST/Minority: 50%

Documents Required for Scholarship Form Filling
Students must bring self-attested copies and originals of the following:
Academic Fee Receipt (2025–26) & College ID Card.
Hostel Fee Receipt & Hostel ID Card (for in-campus hostellers).
Seat Allotment / Provisional Admission Letter (JEE/NEET/CUET, if applicable).
Entrance Exam Result (JEE/NEET/CUET – as applicable).
Parent's Income, Student's Category, and Student's Domicile Certificates.
E-District Verification Sheets for Income/Category/Domicile.
Minimum 75% Attendance Sheet (Verified & Recommended by HOD).
Qualifying Exam Marksheets:
10th
12th
Diploma (for Lateral Entry)
Graduation (for PG applicants)
Last Year Passed Marksheet (Verified by Exam Cell)
Bank Passbook Copy (Student Name, Account No., IFSC, Branch).
Aadhaar Card Copies (Student & Parents).

Important Instructions:
Ensure all documents are clear, updated, and valid.
Bring a printout of all required documents for faster processing and better support at the helpdesk.
Provide the correct mobile number and ensure the bank account is Aadhaar-linked & NPCI mapped.
Incomplete documentation may delay or prevent scholarship submission.
Students are advised to bring their own laptop for form filling.

For Assistance, Contact:
Mr. Jitendra Kumar
Scholarship Nodal Officer
Office of the Dean, Students' Welfare
Sharda University, Greater Noida"""
    }
]

def extract_keywords_from_content() -> Dict:
    """Extract meaningful keywords from email content"""
    
    subjects = [e.get('subject', '') for e in EMAILS]
    bodies = [e.get('body', '') for e in EMAILS if e.get('body')]
    full_text = ' '.join(subjects + bodies).lower()
    
    # What's Happening specific keywords
    keywords = {
        # Event types
        'christmas',
        'new year',
        'carnival',
        'fire safety',
        'awareness workshop',
        'scholarship',
        'helpdesk',
        'awareness camp',
        'up scholarship',
        
        # Event characteristics
        'fun-filled event',
        'team building',
        'cross-department interaction',
        'campus safety',
        'fire prevention',
        'emergency handling',
        'fire safety equipment',
        'fire extinguishers',
        'safe evacuation',
        'emergency response',
        
        # Event activities
        'performances',
        'stalls',
        'food',
        'games',
        'art and craft',
        'activities',
        'shopping',
        'first-come first-serve',
        'stall bookings',
        
        # Organizational roles
        'advisor',
        'convener',
        'coordinator',
        'speaker',
        'registrar',
        'chief human resources officer',
        'hr department',
        'dean students welfare',
        'dsw',
        'ncc unit',
        'ncc cadets',
        'ncc',
        
        # Venues
        'sports ground',
        'mandela hostel',
        'block 4 ground',
        'lawn',
        'block-3',
        
        # Scholarship specific
        'scholarship application',
        'fresh application',
        'renewal application',
        'form filling',
        'document verification',
        'eligibility checks',
        'technical assistance',
        'domicile certificate',
        'category certificate',
        'income certificate',
        'aadhaar card',
        'attendance sheet',
        'bank passbook',
        'exam cell',
        'nodal officer',
        
        # Dates and time
        '19th dec 2025',
        '12th december',
        '11th 12th december',
        'friday',
        '12:00 pm',
        '5:00 pm',
        '3:00 pm',
        '4:00 pm',
        '10:00 am',
        '04:00 pm',
        
        # Departments/Organizations
        'human resource department',
        'sharda hospital',
        'shardacare healthcity',
        'sharda university',
        'medical wing',
        'learning & development',
        'students welfare',
        'armed forces flag day',
        
        # Event objectives
        'sparking joy',
        'create enjoyable memories',
        'employee & student participation',
        'student participation',
        'employee participation',
    }
    
    # Extract additional phrases from subjects
    subject_phrases = []
    for subject in subjects:
        # Extract capitalized phrases
        phrases = re.findall(r'([A-Z][a-z]+(?:\s+[&/]\s+[A-Z][a-z]+)*(?:\s+[A-Z][a-z]+)*)', subject)
        subject_phrases.extend([p.lower() for p in phrases if len(p) > 3])
    
    keywords.update(set(subject_phrases))
    
    # Extract date patterns
    date_patterns = re.findall(r'(\d+(?:st|nd|rd|th)?\s+(?:dec|december|jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november)\s+\d{4})', full_text, re.IGNORECASE)
    keywords.update([d.lower() for d in date_patterns])
    
    # Extract time patterns
    time_patterns = re.findall(r'(\d+:\d+\s*(?:am|pm|AM|PM)\s*(?:-\s*\d+:\d+\s*(?:am|pm|AM|PM))?)', full_text)
    keywords.update([t.lower() for t in time_patterns])
    
    # Separate into primary keywords and phrases
    primary_keywords = []
    phrases = []
    
    for item in sorted(keywords):
        words = item.split()
        if len(words) == 1 and len(item) >= 4:
            primary_keywords.append(item)
        elif len(words) >= 2:
            phrases.append(item)
        else:
            if len(item) >= 4:
                primary_keywords.append(item)
    
    return {
        'primary_keywords': sorted(set(primary_keywords)),
        'phrases': sorted(set(phrases)),
        'topics': []
    }

def check_existing_keywords() -> Dict[str, Set[str]]:
    """Read existing keywords from keywordCategories.js"""
    try:
        with open('server/src/config/keywordCategories.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract Whats happening section
        whats_match = re.search(
            r"'Whats happening':\s*\{[^}]*?primaryKeywords:\s*\[(.*?)\],\s*secondaryKeywords:\s*\[(.*?)\],\s*phrases:\s*\[(.*?)\],",
            content,
            re.DOTALL
        )
        
        if whats_match:
            existing_primary = set(re.findall(r"'([^']+)'", whats_match.group(1)))
            existing_secondary = set(re.findall(r"'([^']+)'", whats_match.group(2)))
            existing_phrases = set(re.findall(r"'([^']+)'", whats_match.group(3)))
            
            return {
                'primary': existing_primary,
                'secondary': existing_secondary,
                'phrases': existing_phrases
            }
    except Exception as e:
        print(f"Warning: Could not read existing keywords: {e}")
    
    return {'primary': set(), 'secondary': set(), 'phrases': set()}

def main():
    """Main extraction function"""
    print("="*60)
    print("What's Happening Keyword Extraction Tool")
    print("="*60)
    print(f"\nAnalyzing {len(EMAILS)} email(s)...")
    
    if len(EMAILS) == 0:
        print("\n[!] No emails found! Please add email content to the EMAILS list.")
        return
    
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
        'extraction_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
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
    output_file = f'whatshappening_keywords_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print("EXTRACTION COMPLETE")
    print(f"{'='*60}")
    print(f"\n[+] New Primary Keywords: {len(new_primary)}")
    if new_primary:
        for kw in new_primary[:25]:
            print(f"   - {kw}")
        if len(new_primary) > 25:
            print(f"   ... and {len(new_primary) - 25} more")
    else:
        print("   (none - all already exist)")
    
    print(f"\n[+] New Phrases: {len(new_phrases)}")
    if new_phrases:
        for phrase in new_phrases[:25]:
            print(f"   - {phrase}")
        if len(new_phrases) > 25:
            print(f"   ... and {len(new_phrases) - 25} more")
    else:
        print("   (none - all already exist)")
    
    print(f"\n[FILE] Full report saved to: {output_file}")
    print(f"\n[NEXT STEPS]")
    print(f"   1. Review the keywords in {output_file}")
    print(f"   2. Update server/src/config/keywordCategories.js with new keywords")
    print(f"   3. Test the classification with the updated keywords")
    
    return report

if __name__ == "__main__":
    main()

