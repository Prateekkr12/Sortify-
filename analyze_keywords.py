"""
Keyword Analysis Script
Analyzes emails and existing keyword patterns to suggest new relatable keywords
"""

import re
import json
import os
from collections import Counter, defaultdict
from typing import Dict, List, Set

# Read existing keyword categories
def read_existing_keywords():
    """Read existing keywords from keywordCategories.js"""
    keyword_file = 'server/src/config/keywordCategories.js'
    
    # Read the file
    with open(keyword_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract category names and their keywords
    categories = {}
    
    # Pattern to match category definitions
    category_pattern = r"'([^']+)':\s*\{[^}]*?primaryKeywords:\s*\[(.*?)\],\s*secondaryKeywords:\s*\[(.*?)\],\s*phrases:\s*\[(.*?)\],"
    
    matches = re.finditer(category_pattern, content, re.DOTALL)
    
    for match in matches:
        category = match.group(1)
        primary = re.findall(r"'([^']+)'", match.group(2))
        secondary = re.findall(r"'([^']+)'", match.group(3))
        phrases = re.findall(r"'([^']+)'", match.group(4))
        
        categories[category] = {
            'primaryKeywords': set(primary),
            'secondaryKeywords': set(secondary),
            'phrases': set(phrases)
        }
    
    return categories

# Read sample emails
def read_sample_emails():
    """Read sample email files"""
    emails = []
    email_dir = 'data'
    
    for i in range(1, 6):
        email_file = os.path.join(email_dir, f'sample_email{i}.eml')
        if os.path.exists(email_file):
            with open(email_file, 'r', encoding='utf-8') as f:
                content = f.read()
                emails.append(content)
    
    return emails

# Extract keywords from text
def extract_keywords(text: str, min_length: int = 3) -> List[str]:
    """Extract keywords from text"""
    # Convert to lowercase
    text = text.lower()
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    
    # Extract words
    words = re.findall(r'\b[a-z]{' + str(min_length) + r',}\b', text)
    
    # Remove common stopwords
    stopwords = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
        'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
        'his', 'her', 'its', 'our', 'their', 'him', 'them', 'me', 'us'
    }
    
    keywords = [w for w in words if w not in stopwords and len(w) >= min_length]
    
    return keywords

# Extract phrases from text (2-3 word combinations)
def extract_phrases(text: str, max_phrase_length: int = 3) -> List[str]:
    """Extract phrases (multi-word combinations) from text"""
    text = text.lower()
    
    # Remove email addresses and URLs
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'https?://\S+', '', text)
    
    # Extract sentences
    sentences = re.split(r'[.!?]\s+', text)
    
    phrases = []
    for sentence in sentences:
        words = re.findall(r'\b[a-z]{3,}\b', sentence)
        
        # Generate 2-word phrases
        for i in range(len(words) - 1):
            phrase = f"{words[i]} {words[i+1]}"
            if len(phrase) > 5:  # Minimum phrase length
                phrases.append(phrase)
        
        # Generate 3-word phrases
        if max_phrase_length >= 3:
            for i in range(len(words) - 2):
                phrase = f"{words[i]} {words[i+1]} {words[i+2]}"
                phrases.append(phrase)
    
    return phrases

# Analyze emails and suggest keywords
def analyze_emails_for_keywords(emails: List[str], existing_keywords: Dict) -> Dict:
    """Analyze emails to find new keywords"""
    
    # Categorize emails by their existing classification (from file names/content)
    email_categories = {
        'Academic': emails[0] if len(emails) > 0 else '',
        'Spam': emails[1] if len(emails) > 1 else '',
        'Placement': emails[2] if len(emails) > 2 else '',
        'Promotions': emails[3] if len(emails) > 3 else '',
        'Other': emails[4] if len(emails) > 4 else ''
    }
    
    suggested_keywords = defaultdict(lambda: {
        'new_primary': set(),
        'new_secondary': set(),
        'new_phrases': set()
    })
    
    for category, email_content in email_categories.items():
        if not email_content:
            continue
        
        # Extract keywords and phrases
        keywords = extract_keywords(email_content)
        phrases = extract_phrases(email_content)
        
        # Get existing keywords for this category
        existing = existing_keywords.get(category, {
            'primaryKeywords': set(),
            'secondaryKeywords': set(),
            'phrases': set()
        })
        
        all_existing = existing['primaryKeywords'] | existing['secondaryKeywords']
        
        # Find new keywords
        keyword_counter = Counter(keywords)
        phrase_counter = Counter(phrases)
        
        # Suggest keywords that appear multiple times but aren't in existing
        for keyword, count in keyword_counter.items():
            if keyword not in all_existing and count >= 2:
                suggested_keywords[category]['new_secondary'].add(keyword)
            elif keyword not in all_existing and count >= 1:
                suggested_keywords[category]['new_secondary'].add(keyword)
        
        # Suggest phrases
        for phrase, count in phrase_counter.items():
            if phrase not in existing['phrases'] and count >= 1:
                suggested_keywords[category]['new_phrases'].add(phrase)
    
    return suggested_keywords

# Generate comprehensive keyword suggestions based on domain knowledge
def generate_domain_keywords():
    """Generate domain-specific keyword suggestions based on common email patterns"""
    
    suggestions = {
        'Placement': {
            'new_primary': {
                'recruitment', 'job opening', 'job vacancy', 'we are hiring',
                'looking for', 'join our team', 'apply for this position',
                'submit your resume', 'send your cv', 'interview scheduled',
                'interview process', 'selection round', 'final round',
                'offer letter sent', 'congratulations on selection',
                'welcome aboard', 'pre-placement offer', 'full-time position',
                'part-time opportunity', 'internship program', 'summer internship',
                'winter internship', 'training program', 'mandatory training',
                'orientation program', 'document submission',
                'background verification', 'joining formalities',
                'salary package', 'ctc offered', 'annual package',
                'monthly stipend', 'work from home opportunity',
                'remote work', 'hybrid model', 'technical interview',
                'hr interview', 'managerial round', 'final interview',
                'aptitude assessment', 'coding challenge',
                'technical assessment', 'group discussion round',
                'presentation round', 'case study round',
                'resume shortlisting round', 'pre-placement talk',
                'company presentation', 'walk-in interview',
                'off-campus drive', 'on-campus drive'
            },
            'new_secondary': {
                'resume', 'cv', 'application', 'candidate', 'applicant',
                'shortlist', 'shortlisted', 'selected', 'rejected',
                'pending', 'under review', 'screening', 'profile',
                'qualification', 'eligibility', 'requirement', 'prerequisite',
                'experience', 'fresher', 'experienced', 'skills',
                'technical skills', 'communication skills', 'soft skills',
                'round', 'stage', 'level', 'process', 'procedure',
                'schedule', 'timing', 'venue', 'location', 'address',
                'contact', 'reach out', 'follow up', 'next steps',
                'document', 'paperwork', 'form', 'formality', 'clearance'
            },
            'new_phrases': {
                'we are pleased to inform', 'congratulations you have been',
                'thank you for your interest', 'we regret to inform',
                'unfortunately we cannot', 'thank you for applying',
                'we have reviewed your application', 'please find attached',
                'looking forward to hearing', 'please confirm your attendance',
                'we look forward to meeting', 'interview call letter',
                'job description attached', 'kindly revert', 'please revert',
                'awaiting your response', 'please confirm'
            }
        },
        'NPTEL': {
            'new_primary': {
                'course registration', 'lecture video', 'nptel course',
                'online exam', 'certificate exam', 'course material',
                'nptel newsletter', 'star badges', 'professor who never stopped',
                'lifelong learning', 'joint certification by cii',
                'advance your supply chain career', 'best wishes from nptel',
                'nptel online course', 'nptel registration',
                'enrollment confirmation', 'course enrollment',
                'weekly assignment submission', 'assignment due date',
                'quiz submission', 'proctored exam registration',
                'exam registration open', 'hall ticket download',
                'course completion certificate', 'verified certificate download',
                'digital certificate', 'joint certification program',
                'scmpro certification', 'iit madras nptel',
                'swayam nptel platform'
            },
            'new_secondary': {
                'swayam', 'mooc', 'massive open online course',
                'video lectures', 'quiz', 'weekly quiz',
                'assignment submission', 'due date', 'deadline',
                'course content', 'syllabus', 'course outline',
                'instructor', 'professor', 'teaching assistant', 'ta',
                'forum', 'discussion forum', 'peer assessment',
                'final exam', 'proctored', 'proctoring', 'exam slot',
                'hall ticket', 'admit card', 'score', 'grade',
                'passing criteria', 'certificate criteria',
                'pass percentage', 'minimum score', 'average score',
                'topper', 'leaderboard'
            },
            'new_phrases': {
                'enroll now', 'register for course', 'start learning',
                'watch lecture videos', 'complete assignments',
                'appear for exam', 'download certificate',
                'course starts', 'registration closes', 'last date to enroll'
            }
        },
        'Professor': {
            'new_primary': {
                'project evaluation', 'check attendance', 'dear faculty',
                'dear students', 'training session', 'start your exam',
                'link is active', 'prepare the ppt', 'discussion with guide',
                'dear faculty members', 'dear all students',
                'project submission date', 'assignment submission',
                'lab submission', 'report submission deadline',
                'viva voce schedule', 'project presentation',
                'seminar presentation', 'internal assessment',
                'mid semester exam', 'end semester exam',
                'attendance sheet', 'attendance record',
                'low attendance warning', 'attendance requirement',
                'minimum attendance needed', 'lecture schedule',
                'tutorial schedule', 'lab schedule', 'office hours',
                'meet me in', 'office cabin', 'consultation hours',
                'project guidance meeting', 'thesis guidance',
                'research discussion', 'data uploaded on portal',
                'check your attendance', 'verify attendance',
                'mark attendance', 'attendance short list',
                'students with low attendance'
            },
            'new_secondary': {
                'submission', 'deadline', 'due date', 'last date',
                'late submission', 'extension', 're-submission',
                'evaluation', 'assessment', 'grading', 'marks',
                'score', 'grade', 'feedback', 'review',
                'correction', 'revision', 'improvement',
                'attendance', 'present', 'absent', 'leave',
                'medical leave', 'casual leave', 'absence',
                'percentage', 'shortage', 'warning',
                'compulsory', 'mandatory', 'optional',
                'guidance', 'consultation', 'doubt clearing',
                'discussion', 'meeting', 'appointment'
            },
            'new_phrases': {
                'submit before', 'last date for submission',
                'late submission will not be accepted',
                'strictly adhere to deadline', 'kindly submit',
                'please ensure submission', 'evaluation criteria',
                'grading scheme', 'attendance is mandatory',
                'minimum attendance required', 'students with attendance below',
                'meet me during office hours', 'doubt clearing session',
                'for any queries contact', 'please revert'
            }
        },
        'HOD': {
            'new_primary': {
                'department notice', 'official notice', 'administrative notice',
                'department circular', 'official circular', 'hod circular',
                'all students are requested', 'all students are informed',
                'mandatory for all students', 'all faculty members are requested',
                'reschedule evaluation date', 'meeting with hod', 'hod meeting',
                'department meeting', 'faculty meeting', 'student meeting',
                'urgent', 'important', 'immediate attention',
                'all faculty members', 'all staff', 'department office',
                'hod cabin', 'office hours', 'contact hod',
                'reschedule exam', 'exam reschedule', 'date change',
                'schedule change', 'evaluation reschedule',
                'project evaluation', 'semester schedule',
                'academic calendar', 'department calendar',
                'cse department', 'computer science department',
                'department of computer science'
            },
            'new_secondary': {
                'circular', 'notice', 'announcement', 'notification',
                'information', 'update', 'change', 'reschedule',
                'postpone', 'prepone', 'cancellation', 'cancelled',
                'meeting', 'conference', 'discussion', 'session',
                'all', 'everyone', 'mandatory', 'compulsory',
                'important', 'urgent', 'immediate', 'attention',
                'requested', 'informed', 'instructed', 'directed'
            },
            'new_phrases': {
                'all students are hereby informed', 'this is to inform all',
                'all faculty members are requested to', 'kind attention of all',
                'it is mandatory for all', 'strict compliance required',
                'please note that', 'important notice for all',
                'urgent attention required', 'immediate action needed'
            }
        },
        'Whats happening': {
            'new_primary': {
                'upcoming event', 'next event', 'event registration',
                'event details', 'event schedule', 'event venue',
                'event date and time', 'join us for', 'we are organizing',
                'we are hosting', 'participate in', 'register now',
                'limited seats', 'early bird registration',
                'last date to register', 'registration open',
                'registration closed', 'expert talk on',
                'guest lecture by', 'workshop on', 'seminar on',
                'conference on', 'symposium on', 'webinar on',
                'meetup on', 'competition registration',
                'contest registration', 'hackathon registration',
                'quiz competition', 'dance competition',
                'singing competition', 'cultural fest', 'tech fest',
                'annual fest', 'college fest', 'tree plantation drive',
                'social awareness program', 'community service',
                'volunteer opportunity', 'nss activity', 'nss program'
            },
            'new_secondary': {
                'event', 'activity', 'program', 'celebration',
                'workshop', 'seminar', 'conference', 'symposium',
                'webinar', 'meetup', 'competition', 'contest',
                'hackathon', 'quiz', 'fest', 'festival',
                'cultural', 'technical', 'sports', 'academic',
                'social', 'community', 'university', 'campus',
                'registration', 'participate', 'attend', 'join',
                'venue', 'location', 'date', 'time', 'schedule',
                'organizer', 'coordinator', 'contact', 'register'
            },
            'new_phrases': {
                'we cordially invite', 'you are invited to',
                'please join us', 'be a part of', 'don\'t miss',
                'register today', 'limited seats available',
                'first come first serve', 'registration mandatory',
                'all are welcome', 'open for all', 'free entry',
                'refreshments will be provided', 'certificate will be provided'
            }
        },
        'Promotions': {
            'new_primary': {
                'flash sale', 'clearance sale', 'end of season sale',
                'festival offer', 'grand sale', 'mega discount',
                'huge savings', 'buy one get one', 'free consultation',
                'health checkup camp', 'medical screening camp',
                'free health screening', 'health awareness program',
                'wellness program', 'doctor consultation offer',
                'medical checkup offer', 'health package deal',
                'diagnostic test offer', 'lab test discount',
                'healthcare services', 'shardacare healthcity',
                'healthcare promotions', 'medical promotions'
            },
            'new_secondary': {
                'offer', 'deal', 'discount', 'sale', 'promotion',
                'special', 'exclusive', 'limited', 'flash', 'clearance',
                'save', 'save money', 'save up to', 'up to',
                'percent off', 'percentage discount', 'free',
                'complimentary', 'bonus', 'extra', 'additional',
                'valid till', 'expires', 'expiry', 'limited time',
                'hurry', 'act now', 'don\'t miss', 'grab now',
                'buy now', 'shop now', 'order now'
            },
            'new_phrases': {
                'limited time offer', 'special discount',
                'save money', 'don\'t miss out', 'act now',
                'limited stock', 'while stocks last',
                'terms and conditions apply', 'valid till stock lasts'
            }
        },
        'E-Zone': {
            'new_primary': {
                'password reset request', 'forgot password',
                'reset your password', 'account verification code',
                'verification code for login', 'portal access granted',
                'your portal credentials', 'login details',
                'dear user welcome to sharda e-zone',
                'your one-time password', 'valid for today only',
                'accessing sharda e-zone portal',
                'portal maintenance scheduled', 'portal system update'
            },
            'new_secondary': {
                'login', 'password', 'otp', 'one time password',
                'password reset', 'account verification',
                'login credentials', 'portal credentials',
                'verification code', 'access', 'account',
                'user', 'username', 'user id', 'student id',
                'enrollment number', 'roll number', 'registration number',
                'credentials', 'authentication', 'authorization',
                'session', 'timeout', 'expired', 'invalid',
                'locked', 'blocked', 'activated', 'verified',
                'maintenance', 'update', 'system', 'portal'
            },
            'new_phrases': {
                'your login credentials', 'your one-time password is',
                'valid for today', 'please keep this secure',
                'do not share', 'if you did not request',
                'please ignore', 'portal will be under maintenance',
                'we apologize for inconvenience'
            }
        }
    }
    
    return suggestions

# Main analysis function
def main():
    print("=" * 60)
    print("KEYWORD ANALYSIS AND SUGGESTION TOOL")
    print("=" * 60)
    
    # Read existing keywords
    print("\n1. Reading existing keywords...")
    existing_keywords = read_existing_keywords()
    print(f"   Found {len(existing_keywords)} categories")
    
    # Read sample emails
    print("\n2. Reading sample emails...")
    sample_emails = read_sample_emails()
    print(f"   Found {len(sample_emails)} sample emails")
    
    # Analyze emails
    print("\n3. Analyzing emails for new keywords...")
    suggested_from_emails = analyze_emails_for_keywords(sample_emails, existing_keywords)
    
    # Generate domain-specific suggestions
    print("\n4. Generating domain-specific keyword suggestions...")
    domain_suggestions = generate_domain_keywords()
    
    # Combine suggestions
    print("\n5. Combining all suggestions...")
    all_suggestions = defaultdict(lambda: {
        'new_primary': set(),
        'new_secondary': set(),
        'new_phrases': set()
    })
    
    for category in existing_keywords.keys():
        # Add email-based suggestions
        if category in suggested_from_emails:
            all_suggestions[category]['new_primary'].update(
                suggested_from_emails[category]['new_primary']
            )
            all_suggestions[category]['new_secondary'].update(
                suggested_from_emails[category]['new_secondary']
            )
            all_suggestions[category]['new_phrases'].update(
                suggested_from_emails[category]['new_phrases']
            )
        
        # Add domain-specific suggestions
        if category in domain_suggestions:
            all_suggestions[category]['new_primary'].update(
                domain_suggestions[category]['new_primary']
            )
            all_suggestions[category]['new_secondary'].update(
                domain_suggestions[category]['new_secondary']
            )
            all_suggestions[category]['new_phrases'].update(
                domain_suggestions[category]['new_phrases']
            )
    
    # Generate report
    print("\n6. Generating keyword suggestion report...")
    report = {
        'analysis_date': '2024',
        'categories_analyzed': list(existing_keywords.keys()),
        'suggestions': {}
    }
    
    for category, suggestions in all_suggestions.items():
        # Filter out keywords that already exist
        existing = existing_keywords.get(category, {
            'primaryKeywords': set(),
            'secondaryKeywords': set(),
            'phrases': set()
        })
        
        all_existing_primary = existing['primaryKeywords']
        all_existing_secondary = existing['secondaryKeywords']
        all_existing_phrases = existing['phrases']
        
        new_primary = [
            kw for kw in suggestions['new_primary']
            if kw.lower() not in {k.lower() for k in all_existing_primary}
        ]
        new_secondary = [
            kw for kw in suggestions['new_secondary']
            if kw.lower() not in {k.lower() for k in all_existing_primary | all_existing_secondary}
        ]
        new_phrases = [
            ph for ph in suggestions['new_phrases']
            if ph.lower() not in {p.lower() for p in all_existing_phrases}
        ]
        
        report['suggestions'][category] = {
            'new_primary_keywords': sorted(new_primary),
            'new_secondary_keywords': sorted(new_secondary),
            'new_phrases': sorted(new_phrases),
            'counts': {
                'primary': len(new_primary),
                'secondary': len(new_secondary),
                'phrases': len(new_phrases)
            }
        }
    
    # Save report
    output_file = 'keyword_suggestions.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n7. Report saved to {output_file}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("KEYWORD SUGGESTION SUMMARY")
    print("=" * 60)
    
    total_new = 0
    for category, data in report['suggestions'].items():
        counts = data['counts']
        total = counts['primary'] + counts['secondary'] + counts['phrases']
        total_new += total
        
        print(f"\n{category}:")
        print(f"  New Primary Keywords: {counts['primary']}")
        print(f"  New Secondary Keywords: {counts['secondary']}")
        print(f"  New Phrases: {counts['phrases']}")
        print(f"  Total New: {total}")
    
    print(f"\n{'=' * 60}")
    print(f"Total new keywords/phrases suggested: {total_new}")
    print(f"{'=' * 60}")
    
    return report

if __name__ == "__main__":
    main()

