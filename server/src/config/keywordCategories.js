// Enhanced keyword dictionaries for rule-based email classification
// Organized by category with primary keywords, secondary keywords, phrases, and exclusions
// Comprehensive keyword lists for 95%+ accuracy

export const KEYWORD_CATEGORIES = {
  'Placement': {
    priority: 'high',
    primaryKeywords: [
      'placement', 'job', 'recruitment', 'interview', 'career', 'apply', 'deadline', 
      'opportunity', 'campus', 'drive', 'resume', 'shortlisting', 'assessment',
      'su placement', 'placement officer', 'sharda informatics', 'placement drive',
      'hiring', 'recruiter', 'employment', 'position', 'opening', 'vacancy',
      'selection', 'campus drive', 'campus recruitment', 'job opportunity',
      'career opportunity', 'talent acquisition', 'hr round', 'technical round',
      'aptitude test', 'coding test', 'group discussion', 'gd', 'final round',
      'offer letter', 'joining', 'onboarding', 'pre-placement', 'ppo', 'fppo',
      'campus hiring', 'off-campus', 'on-campus', 'walk-in drive', 'walk in drive'
    ],
    secondaryKeywords: [
      'company', 'position', 'role', 'skills', 'shortlisted students', 'talent hiring',
      'accenture', 'tcs', 'infosys', 'wipro', 'cognizant', 'google', 'microsoft', 
      'amazon', 'ibm', 'oracle', 'sap', 'adobe', 'meta', 'apple', 'salary', 'package', 
      'ctc', 'pre-placement', 'training', 'mandatory attendance', 'agent ai challenge',
      'network people services', 'npst', 'josh technology', 'tech mahindra',
      'quality assurance', 'qa', 'software engineer', 'developer', 'analyst',
      'consultant', 'manager', 'intern', 'internship', 'full-time', 'part-time',
      'contract', 'referral', 'networking', 'linkedin', 'naukri', 'indeed',
      'glassdoor', 'hiring manager', 'hr', 'recruiter', 'talent acquisition',
      'work from home', 'wfh', 'remote', 'hybrid', 'onsite', 'lpa', 'lakh',
      'crore', 'rs.', 'rupees', 'stipend', 'bonus', 'benefits', 'perks',
      'professional', 'industry', 'corporate', 'cv', 'portfolio',
      'leetcode', 'hackerrank', 'codechef', 'codeforces', 'aptitude', 'reasoning',
      'verbal', 'written test', 'online test', 'offline test', 'walk-in',
      'walk in', 'telephonic', 'phone interview', 'video call', 'zoom interview',
      'application form', 'registration', 'apply now', 'apply before', 'last date',
      'document verification', 'background check', 'joining date', 'notice period',
      'relocation', 'bengaluru', 'bangalore', 'pune', 'hyderabad', 'chennai',
      'mumbai', 'delhi', 'gurgaon', 'noida', 'jaipur', 'kolkata', 'tcs nqt',
      'capgemini', 'lti', 'mindtree', 'mphasis', 'hcl', 'tcs digital', 'tcs ninja',
      'infosys spec', 'infosys power', 'wipro elite', 'wipro turbo', 'co-cubes',
      'amcat', 'e-litmus', 'placement cell', 'tpo', 'training and placement',
      'candidate', 'applicant', 'shortlist', 'shortlisted', 'selected', 'rejected',
      'pending', 'under review', 'screening', 'profile', 'qualification',
      'eligibility', 'requirement', 'prerequisite', 'experience', 'fresher',
      'experienced', 'technical skills', 'communication skills', 'soft skills',
      'application', 'candidate', 'next steps', 'reach out', 'follow up',
      'document', 'paperwork', 'form', 'formality', 'clearance', 'address',
      'contact', 'location', 'venue', 'schedule', 'timing', 'round', 'stage',
      'level', 'process', 'procedure'
    ],
    phrases: [
      'placement drive', 'job opportunity', 'apply now', 'interview round', 
      'career opportunity', 'campus recruitment', 'selection process', 
      'resume shortlisting', 'upcoming resume shortlisting', 'placement opportunity',
      'agent ai challenge', 'pre-placement training', 'mandatory attendance',
      'application for the position', 'next stage of your application',
      'shortlisted students', 'talent hiring', 'campus drive', 'campus recruitment',
      'job opening', 'job vacancy', 'we are hiring', 'looking for', 'join our team',
      'apply for this position', 'submit your resume', 'send your cv',
      'interview scheduled', 'interview process', 'selection round', 'final round',
      'offer letter sent', 'congratulations on selection', 'welcome aboard',
      'pre-placement offer', 'full-time position', 'part-time opportunity',
      'internship program', 'summer internship', 'winter internship',
      'training program', 'mandatory training', 'orientation program',
      'document submission', 'background verification', 'joining formalities',
      'salary package', 'ctc offered', 'annual package', 'monthly stipend',
      'work from home opportunity', 'remote work', 'hybrid model',
      'technical interview', 'hr interview', 'managerial round', 'final interview',
      'aptitude assessment', 'coding challenge', 'technical assessment',
      'group discussion round', 'presentation round', 'case study round',
      'resume shortlisting round', 'pre-placement talk', 'company presentation',
      'walk-in interview', 'off-campus drive', 'on-campus drive',
      'we are pleased to inform', 'congratulations you have been',
      'thank you for your interest', 'we regret to inform',
      'unfortunately we cannot', 'thank you for applying',
      'we have reviewed your application', 'please find attached',
      'looking forward to hearing', 'please confirm your attendance',
      'we look forward to meeting', 'interview call letter',
      'job description attached', 'kindly revert', 'please revert',
      'awaiting your response', 'please confirm'
    ],
    exclusionKeywords: [
      'nptel course', 'nptel exam', 'hod notice', 'professor email', 'academic course',
      'servicenow', 'service-now', 'nowlearning', 'service now university', 'academic partnerships',
      'certified application developer', 'cad certification', 'dr.', 'professor', 'assistant professor',
      'associate professor', 'faculty', 'hod', 'head of department',
      'security alert', 'security notification', 'google security', 'account security', 'sign-in',
      'new sign-in', 'suspicious activity', 'unusual activity', 'security checkup'
    ],
    patterns: {
      senderDomains: [
        'infylearn.com', 'naukri.com', 'linkedin.com', 'placement.com',
        'careers.com', 'jobs.com', 'sharda.ac.in', 'placement.sharda.ac.in',
        'tpo.sharda.ac.in', 'shardainformatics.com'
      ],
      senderNames: [
        'Placement Cell', 'HR Department', 'Recruitment Team', 'Career Services',
        'SU Placement', 'Placement Officer', 'Training and Placement', 'TPO',
        'Hiring Manager', 'Talent Acquisition', 'Recruiter', 'HR Executive',
        'Career Counselor', 'Placement Coordinator', 'Sharda Informatics'
      ],
      // Exclude specific sender domains/names that should not match Placement
      excludeDomains: [
        'service-now.com', 'servicenow.com', 'nowlearning.com',
        'accounts.google.com', 'mail.google.com', 'google.com',
        'geeksforgeeks.org', 'geeksforgeeks.com'
      ],
      excludeNames: [
        'ServiceNow', 'ServiceNow University', 'nowlearning',
        'Google', 'Google Account', 'Google Security', 'Gmail Security', 'Security Alert',
        'GeeksforGeeks', 'Geeks for Geeks', 'GfG'
      ]
    }
  },
  
  'NPTEL': {
    priority: 'high',
    primaryKeywords: [
      'nptel', 'course', 'lecture', 'registration', 'exam', 'certificate', 'iitm',
      'online', 'learning', 'study', 'newsletter', 'module', 'assignment', 'video',
      'nptel team', 'nptel newsletter', 'iit madras', 'onlinecourses.nptel.ac.in',
      'nptel.ac.in', 'nptel.iitm.ac.in', 'enrollment', 'enrolled', 'course material',
      'weekly assignment', 'proctored exam', 'end term exam', 'mid term exam',
      'certificate exam', 'exam registration', 'exam date', 'course completion',
      'verified certificate', 'e-certificate', 'digital certificate', 'joint certification',
      'scmpro', 'star badges', 'lifelong learning', 'cohort', 'evend', 'emobility',
      'swayam-nptel', 'weeks', 'e-verifiable', 'iit roorkee'
    ],
    secondaryKeywords: [
      'star badges', 'scmpro', 'joint certification', 'cii', 
      'professor who never stopped learning', 'lifelong learning', 
      'supply chain career', 'advance your career', 'best wishes from nptel team',
      'iit', 'indian institute of technology', 'swayam', 'swayam nptel',
      'online course', 'mooc', 'massive open online course', 'video lectures',
      'quiz', 'weekly quiz', 'assignment submission', 'due date', 'deadline',
      'course content', 'syllabus', 'course outline', 'instructor', 'professor',
      'teaching assistant', 'ta', 'forum', 'discussion forum', 'peer assessment',
      'final exam', 'proctored', 'proctoring', 'exam slot', 'hall ticket',
      'admit card', 'score', 'grade', 'passing criteria', 'certificate criteria',
      'pass percentage', 'minimum score', 'average score', 'topper', 'leaderboard'
    ],
    phrases: [
      'course registration', 'lecture video', 'nptel course', 'online exam',
      'certificate exam', 'course material', 'nptel newsletter', 'star badges',
      'professor who never stopped learning', 'lifelong learning',
      'joint certification by cii', 'advance your supply chain career',
      'best wishes from the nptel team', 'nptel online course',
      'nptel registration', 'enrollment confirmation', 'course enrollment',
      'weekly assignment submission', 'assignment due date', 'quiz submission',
      'proctored exam registration', 'exam registration open', 'hall ticket download',
      'course completion certificate', 'verified certificate download',
      'digital certificate', 'joint certification program', 'scmpro certification',
      'iit madras nptel', 'swayam nptel platform',
      'enroll now', 'register for course', 'start learning',
      'watch lecture videos', 'complete assignments',
      'appear for exam', 'download certificate',
      'course starts', 'registration closes', 'last date to enroll',
      'leadership and team effectiveness', 'digital transformation strategy',
      'leadership essentials', 'ev journey', 'certified professionals',
      'announcement group', 'ask a question', 'assignment score',
      'average assignment score', 'best 8 assignments', 'certificate criteria',
      'course duration', 'course instructor', 'discussion forum',
      'exam centre', 'exam centres', 'exam score', 'final score',
      'hall ticket', 'hall tickets', 'hours of videos', 'iit roorkee',
      'morning session', 'afternoon session', 'online courses and certification',
      'passing criteria', 'teaching assistant', 'teaching assistants',
      'weekly assignment', 'newsletter announce', 'swayam nptel'
    ],
    exclusionKeywords: [
      'placement drive', 'job opportunity', 'hod notice', 'professor email',
      'servicenow', 'service-now', 'service now university', 'nowlearning',
      'academic partnerships', 'certified application developer', 'cad certification'
    ],
    patterns: {
      senderDomains: [
        'nptel.ac.in', 'nptel.iitm.ac.in', 'onlinecourses.nptel.ac.in',
        'swayam.gov.in', 'swayam.nptel.ac.in'
      ],
      senderNames: [
        'NPTEL', 'NPTEL Team', 'IIT Madras', 'NPTEL Online', 'NPTEL Newsletter',
        'Swayam NPTEL', 'Online Courses', 'newsletter-announce'
      ],
      // Exclude specific sender domains/names that should not match NPTEL
      excludeDomains: [
        'service-now.com', 'servicenow.com', 'nowlearning.com',
        'signonmail.servicenow.com'
      ],
      excludeNames: [
        'ServiceNow University', 'ServiceNow', 'nowlearning',
        'ServiceNow Learning', 'ServiceNow Training'
      ]
    }
  },
  
  'HOD': {
    priority: 'high',  // Changed to high to catch before Professor
    primaryKeywords: [
      'hod', 'head', 'department', 'notice', 'announcement', 'administrative',
      'official', 'mandatory', 'circular', 'reschedule', 'evaluation date',
      'hod office', 'respected hod sir', 'dear students', 'all students',
      'head of department', 'department head', 'dept head', 'hod cse',
      'department notice', 'official notice', 'administrative notice',
      'department circular', 'official circular', 'hod circular'
    ],
    secondaryKeywords: [
      'mark students absent', 'meet me in person', 'tickets booked',
      'dr. sudeep varshney', 'phd', 'iit dhanbad', 'mandatory attendance',
      'department meeting', 'faculty meeting', 'student meeting', 'urgent',
      'important', 'immediate attention', 'all faculty members', 'all staff',
      'department office', 'hod cabin', 'office hours', 'contact hod',
      'reschedule exam', 'exam reschedule', 'date change', 'schedule change',
      'evaluation reschedule', 'project evaluation', 'semester schedule',
      'academic calendar', 'department calendar', 'cse department',
      'computer science department', 'department of computer science'
    ],
    phrases: [
      'hod office', 'head of department', 'department notice',
      'mandatory attendance', 'evaluation date', 'all students',
      'dear students', 'dear all students', 'dear faculty members',
      'department announcement', 'official announcement', 'administrative notice',
      'respected hod sir', 'dear hod', 'hod circular', 'department circular',
      'all students are requested', 'all students are informed',
      'mandatory for all students', 'all faculty members are requested',
      'reschedule evaluation date', 'meeting with hod', 'hod meeting',
      'all students are hereby informed', 'this is to inform all',
      'all faculty members are requested to', 'kind attention of all',
      'it is mandatory for all', 'strict compliance required',
      'please note that', 'important notice for all',
      'urgent attention required', 'immediate action needed'
    ],
    exclusionKeywords: ['placement drive', 'job opportunity', 'nptel course', 'promotion offer'],
    patterns: {
      senderDomains: [
        'hod.cse@sharda.ac.in', 'hod.ece@sharda.ac.in', 'hod.me@sharda.ac.in',
        'hod.ce@sharda.ac.in', 'hod.eee@sharda.ac.in', 'hod.it@sharda.ac.in',
        'hod.ae@sharda.ac.in', 'hod.civil@sharda.ac.in', 'hod.chem@sharda.ac.in',
        'hod.bt@sharda.ac.in', 'hod.biotech@sharda.ac.in', 'hod.mba@sharda.ac.in',
        'hod.law@sharda.ac.in', 'hod.pharmacy@sharda.ac.in', 'hod.medical@sharda.ac.in',
        'hod.nursing@sharda.ac.in', 'hod.physiotherapy@sharda.ac.in',
        'hod.cse.sharda.ac.in', 'hod.ece.sharda.ac.in'
      ],
      senderNames: [
        'HOD CSE', 'HOD ECE', 'HOD ME', 'HOD CE', 'HOD EEE', 'HOD IT', 'HOD AE',
        'HOD', 'Head of Department', 'Head CSE', 'Department Head',
        'Dept Head', 'HoD', 'Head of Dept', 'Head of Department CSE',
        'Head of Department ECE', 'Dr. Sudeep Varshney'
      ]
    }
  },
  
  'E-Zone': {
    priority: 'high',
    primaryKeywords: [
      'sharda e-zone', 'ezone.sharda.ac.in', 'ezone.shardauniversity.com',
      'sharda portal', 'sharda student portal', 'sharda university portal',
      'e-zone login', 'sharda e-zone login', 'sharda account login',
      'sharda password reset', 'sharda account verification',
      'sharda login credentials', 'sharda portal credentials'
    ],
    secondaryKeywords: [
      'valid for today', 'accessing sharda e-zone', 'dear user',
      'welcome to sharda e-zone', 'sharda portal update',
      'sharda system update', 'sharda portal maintenance',
      'sharda access granted', 'sharda account locked',
      'sharda account activated', 'sharda account verified',
      'sharda password changed', 'sharda login successful',
      'sharda invalid credentials', 'sharda student id',
      'sharda enrollment number', 'sharda roll number',
      // Only include generic terms when combined with Sharda context
      'ezone', 'e-zone', 'portal', 'login', 'password', 'otp',
      'one time password', 'password reset', 'account verification',
      'login credentials', 'portal credentials', 'verification code',
      'access', 'account', 'activated', 'authentication', 'authorization',
      'blocked', 'credentials', 'enrollment number', 'expired', 'invalid',
      'locked', 'maintenance', 'registration number', 'roll number',
      'session', 'student id', 'system', 'timeout', 'update', 'user',
      'user id', 'username', 'verified'
    ],
    phrases: [
      'sharda e-zone', 'one time password', 'valid for today',
      'accessing sharda e-zone', 'welcome to sharda e-zone',
      'password reset', 'account access', 'portal login', 'student portal access',
      'login to portal', 'access your account', 'account login credentials',
      'password reset request', 'forgot password', 'reset your password',
      'account verification code', 'verification code for login',
      'portal access granted', 'your portal credentials', 'login details',
      'dear user welcome to sharda e-zone', 'your one-time password',
      'valid for today only', 'accessing sharda e-zone portal',
      'portal maintenance scheduled', 'portal system update',
      'your login credentials', 'your one-time password is',
      'valid for today', 'please keep this secure',
      'do not share', 'if you did not request',
      'please ignore', 'portal will be under maintenance',
      'we apologize for inconvenience'
    ],
    exclusionKeywords: [
      'placement', 'nptel', 'job', 'interview',
      'chatgpt', 'openai', 'chat gpt', 'open ai', 
      'noreply@email.openai.com', 'email.openai.com',
      'geeksforgeeks', 'geeks for geeks', 'gfg', 'geeksforgeeks.org',
      'github', 'github.com', 'support@github.com', 'secrets detected'
    ],
    patterns: {
      senderDomains: [
        'ezone.shardauniversity.com', 'ezone.sharda.ac.in',
        'shardauniversity.com', 'sharda.ac.in'
      ],
      senderNames: [
        'E-Zone', 'E-Zone Support', 'E-Zone Portal', 'Sharda E-Zone',
        'Student Portal', 'Portal Admin', 'E-Zone Team'
      ],
      // Exclude specific sender domains/names that should not match E-Zone
      excludeDomains: [
        'email.openai.com', 'openai.com', 'chatgpt.com',
        'geeksforgeeks.org', 'geeksforgeeks.com',
        'github.com', 'githubusercontent.com'
      ],
      excludeNames: [
        'ChatGPT', 'OpenAI', 'ChatGPT Team',
        'GeeksforGeeks', 'Geeks for Geeks', 'GfG',
        'GitHub', 'GitHub Support', 'GitHub Security'
      ]
    }
  },
  
  'Promotions': {
    priority: 'high',
    primaryKeywords: [
      'offer', 'discount', 'deal', 'sale', 'promotion', 'promotions', 'marketing',
      'advertisement', 'unsubscribe', 'buy', 'limited time', 'special',
      'exclusive', 'save', 'buy now', 'campaign', 'promotional', 'promo',
      'flash sale', 'clearance sale', 'end of season', 'seasonal offer',
      'festival offer', 'holiday offer', 'anniversary sale', 'grand sale',
      'mega sale', 'super sale', 'big sale', 'huge discount', 'massive discount',
      // Healthcare promotional keywords
      'healthcare privilege', 'orthopaedic consultations', 'flat discount',
      '50% off', '50 percent off', 'exclusive healthcare', 'healthcare offer',
      'medical consultation discount', 'consultation discount', 'healthcare discount'
    ],
    secondaryKeywords: [
      'free screening camp', 'shardacare', 'healthcity', 'shardacare healthcity',
      'breast health screening', 'breast cancer awareness', 'welcoming dr',
      'consultant', 'obstetrics', 'gynaecology', 'hosting',
      'delighted to welcome', 'extensive experience', 'promoting women\'s health',
      'early diagnosis', 'prevention', 'click', 'health checkup', 'medical camp',
      'free consultation', 'doctor consultation', 'health awareness', 'medical checkup',
      'preventive care', 'healthcare', 'medical services', 'hospital services',
      'clinic', 'diagnostic center', 'health center', 'wellness center',
      'health screening', 'body checkup', 'general checkup', 'full body checkup',
      'lab test', 'diagnostic test', 'blood test', 'health package',
      'healthcare package', 'medical package', 'checkup package',
      // Additional healthcare promotional keywords
      'empowering women\'s health', 'women\'s health', 'breast health',
      'thermal screening', 'thermal screening device', 'thermal imaging',
      'non-invasive', 'early detection', 'preventive health', 'preventive care',
      'oncologists', 'orthopaedic', 'orthopaedic specialists', 'orthopaedic consultations',
      'joint pain', 'stiffness', 'mobility concerns', 'pain-free',
      'sharda group employees', 'sharda group community', 'immediate family members',
      'exclusive privilege', 'healthcare privilege', 'special offer',
      'ground floor', 'shardacare healthcity', 'team shardacare',
      'camp highlights', 'event detail', 'venue', 'contact'
    ],
    phrases: [
      'limited time offer', 'special discount', 'buy now', 'save money',
      'free screening', 'breast health screening', 'breast cancer awareness',
      'welcoming dr', 'promoting women\'s health', 'early diagnosis and prevention',
      'flash sale', 'clearance sale', 'end of season sale', 'festival offer',
      'grand sale', 'mega discount', 'huge savings', 'buy one get one',
      'free consultation', 'health checkup camp', 'medical screening camp',
      'free health screening', 'health awareness program', 'wellness program',
      'doctor consultation offer', 'medical checkup offer', 'health package deal',
      'diagnostic test offer', 'lab test discount', 'healthcare services',
      'shardacare healthcity', 'healthcare promotions', 'medical promotions',
      'limited time offer', 'special discount',
      'save money', 'don\'t miss out', 'act now',
      'limited stock', 'while stocks last',
      'terms and conditions apply', 'valid till stock lasts',
      // Healthcare promotional phrases
      'empowering women\'s health', 'free breast health screening camp',
      'focused on supporting women\'s health', 'early detection and preventive care',
      'camp highlights', 'free and fully confidential', 'one-on-one consultation',
      'experienced oncologists', 'thermal screening device', 'thermal screening technology',
      'safe and accurate detection', 'completely non-invasive', 'no touch, pain, or discomfort',
      'thermal imaging', 'early signs of potential breast abnormalities',
      'suitable for women of all age groups', 'take advantage of this initiative',
      'make preventive health a priority', 'team shardacare healthcity',
      'exclusive healthcare privilege', 'sharda group employees',
      'flat 50% discount', '50% discount on orthopaedic consultations',
      'special offer is available exclusively', 'immediate family members',
      'expert orthopaedic specialists', 'move better and live pain-free',
      'joint pain, stiffness, or mobility concerns', 'exclusive healthcare privilege for'
    ],
    exclusionKeywords: [
      'placement drive', 'nptel course', 'hod notice', 'exam schedule',
      'canva', 'canva.com', 'engage.canva.com', 'product@engage.canva.com'
    ],
    patterns: {
      senderDomains: [
        'shardacare.com', 'healthcity.com', 'promo.com', 'marketing.com',
        'offers.com', 'deals.com', 'ug.sharda.ac.in'
      ],
      senderNames: [
        'Promotions', 'Offers', 'Marketing Team', 'ShardaCare', 'HealthCity',
        'Promotions Team', 'Marketing', 'Promotional',
        // Pattern matching for "'Promotions' via" senders
        '\'Promotions\' via', '\'Promotions\' via UG Student Group',
        '\'Promotions\' via Batch', 'Promotions via', 'Promotions via UG Student Group',
        'UG Student Group', 'ShardaCare Team', 'Team ShardaCare', 'HealthCity Team'
      ],
      // Exclude specific sender domains/names that should not match Promotions
      excludeDomains: [
        'engage.canva.com', 'canva.com'
      ],
      excludeNames: [
        'Canva', 'Canva Team', 'Canva Pro'
      ]
    }
  },
  
  'Whats happening': {
    priority: 'high',
    primaryKeywords: [
      'event', 'happening', 'campus', 'announcement', 'activity', 'community',
      'participate', 'register', 'venue', 'date', 'organizing', 'celebration',
      'workshop', 'seminar', 'conference', 'symposium', 'webinar', 'meetup',
      'competition', 'contest', 'hackathon', 'quiz', 'fest', 'festival',
      'cultural event', 'technical event', 'sports event', 'academic event',
      'social event', 'community event', 'university event', 'campus activity',
      'carnival', 'christmas', 'scholarship', 'helpdesk', 'advisor', 'convener',
      'coordinator', 'registrar', 'speaker', 'employees', 'faculty', 'students',
      'stalls', 'games', 'food', 'shopping', 'activities', 'performances',
      'department', 'december', 'friday'
    ],
    secondaryKeywords: [
      'nss cell', 'volunteers', 'my bharat portal', 'nurses week',
      'international nurses day', 'aetcom', 'tree plantation', 'startup',
      'fundraise', 'bizgrow', 'sql mastery', 'seminar', 'digital forensics',
      'dsw', 'sharda university', 'enthusiasm', 'sharda school of nursing',
      'attitude ethics communication', 'medico-legal', 'celebrate earth',
      'ihub sharda', 'data pool club', 'expert talk', 'guest lecture',
      'alumni meet', 'farewell', 'welcome party', 'orientation', 'induction',
      'inauguration', 'closing ceremony', 'award ceremony', 'graduation',
      'convocation', 'annual day', 'founders day', 'college day', 'sports day',
      'cultural fest', 'tech fest', 'management fest', 'literary fest',
      'dance competition', 'singing competition', 'debate', 'elocution',
      'essay writing', 'poster making', 'photography', 'film making',
      'coding competition', 'hackathon', 'ideathon', 'startup pitch',
      'business plan', 'case study competition', 'mock interview',
      'placement workshop', 'skill development', 'training workshop',
      'leadership workshop', 'communication skills', 'soft skills',
      'personality development', 'career guidance', 'counseling session',
      'fire safety', 'awareness workshop', 'awareness camp', 'up scholarship',
      'hr department', 'human resource department', 'dean students welfare',
      'ncc unit', 'ncc cadets', 'armed forces flag day', 'campus safety',
      'fire prevention', 'emergency response', 'emergency handling',
      'sharda hospital', 'shardacare healthcity', 'medical wing'
    ],
    phrases: [
      'campus event', 'what\'s happening', 'campus announcement',
      'register for event', 'tree plantation', 'nurses week',
      'international nurses day', 'celebrate earth', 'sql mastery',
      'digital forensics', 'data pool club', 'upcoming event', 'next event',
      'event registration', 'event details', 'event schedule', 'event venue',
      'event date and time', 'join us for', 'we are organizing', 'we are hosting',
      'participate in', 'register now', 'limited seats', 'early bird registration',
      'last date to register', 'registration open', 'registration closed',
      'expert talk on', 'guest lecture by', 'workshop on', 'seminar on',
      'conference on', 'symposium on', 'webinar on', 'meetup on',
      'competition registration', 'contest registration', 'hackathon registration',
      'quiz competition', 'dance competition', 'singing competition',
      'cultural fest', 'tech fest', 'annual fest', 'college fest',
      'tree plantation drive', 'social awareness program', 'community service',
      'volunteer opportunity', 'nss activity', 'nss program',
      'we cordially invite', 'you are invited to',
      'please join us', 'be a part of', 'don\'t miss',
      'register today', 'limited seats available',
      'first come first serve', 'registration mandatory',
      'all are welcome', 'open for all', 'free entry',
      'refreshments will be provided', 'certificate will be provided',
      'christmas & new year carnival', 'fire safety awareness workshop',
      'fire safety equipment', 'fire extinguishers', 'safe evacuation',
      'emergency response', 'emergency handling', 'campus safety',
      'two-day up scholarship helpdesk', 'scholarship application',
      'scholarship helpdesk & awareness camp', 'up scholarship',
      'fresh application', 'renewal application', 'form filling',
      'document verification', 'eligibility checks', 'technical assistance',
      'domicile certificate', 'category certificate', 'income certificate',
      'aadhaar card', 'bank passbook', 'attendance sheet', 'exam cell',
      'nodal officer', 'hr department organizing', 'human resource department',
      'dean students welfare', 'dsw office', 'ncc unit organizing',
      'armed forces flag day', 'chief human resources officer',
      'learning & development', 'stall bookings', 'first-come first-serve',
      'team building', 'cross-department interaction', 'employee & student participation',
      'sparking joy', 'create enjoyable memories', 'art and craft',
      'sports ground', 'opposite mandela hostel', 'block 4 ground',
      'lawn in front of block-3', '19th dec 2025', '12th december 2025',
      '11th & 12th december 2025'
    ],
    exclusionKeywords: ['placement drive', 'job opportunity', 'nptel course', 'exam schedule'],
    patterns: {
      senderDomains: [
        'sharda.ac.in', 'ug.sharda.ac.in', 'events.sharda.ac.in',
        'dsw.sharda.ac.in', 'sgei.org', 'batch2022-2023@ug.sharda.ac.in',
        'ug.group@ug.sharda.ac.in'
      ],
      senderNames: [
        'What\'s Happening', 'Whats Happening', 'Events Team', 'DSW',
        'Student Affairs', 'Event Coordinator', 'Campus Events',
        '\'What\'s Happening\' via Batch', '\'What\'s Happening\' via UG Student Group',
        'Batch 2022-2023', 'UG Student Group'
      ]
    }
  },
  
  'Professor': {
    priority: 'high',  // Changed to high priority to catch before Placement
    primaryKeywords: [
      'professor', 'assistant professor', 'associate professor', 'faculty',
      'dr.', 'evaluation', 'project eval', 'attendance', 'exam',
      'assessment', 'panel members', 'compulsory', 'asst. prof.', 'assoc. prof.',
      'lecturer', 'instructor', 'faculty member', 'teaching faculty',
      'su manager', 'manager', 'senior manager', 'academic manager',
      // Specific professor names from emails
      'nishant gupta', 'kanika singla', 'anubhava srivastava', 'kapil kumar',
      'preeti sharma', 'dr. preeti sharma',
      'dr. nishant gupta', 'dr. kanika singla', 'dr. anubhava srivastava', 'dr. kapil kumar'
    ],
    secondaryKeywords: [
      'spreadsheet shared', 'outcome sheet', 'training session', 'oracle academy',
      'interview scheduled', 'shortlisted students', 'dear faculty', 'dear students',
      'kanika singla', 'anubhava srivastava', 'nishant gupta', 'kapil kumar',
      'computer science engineering', 'set assistant professor',
      'cse associate professor', 'sset assistant professor', 'sscse assistant professor',
      'check attendance',
      'data uploaded', 'start your exam', 'link is active', 'personal interviews',
      'sd role', 'prepare the ppt', 'discussion with the guide', 'project submission',
      'assignment submission', 'lab submission', 'report submission', 'viva voce',
      'viva', 'oral exam', 'presentation', 'project presentation', 'seminar presentation',
      'assignment evaluation', 'lab evaluation', 'project evaluation', 'course evaluation',
      'internal assessment', 'external assessment', 'mid semester exam', 'end semester exam',
      'mid sem exam', 'end sem exam', 'quiz', 'class test', 'unit test', 'surprise test',
      'attendance sheet', 'attendance record', 'attendance status', 'attendance short',
      'low attendance', 'attendance requirement', 'minimum attendance', 'attendance policy',
      'lecture schedule', 'tutorial schedule', 'lab schedule', 'office hours',
      'consultation hours', 'meeting', 'appointment', 'project guidance', 'thesis guidance',
      'research guidance', 'dissertation', 'thesis', 'research work', 'project work'
    ],
    phrases: [
      'assistant professor', 'associate professor', 'project evaluation',
      'check attendance', 'dear faculty', 'dear students', 'training session',
      'start your exam', 'link is active', 'prepare the ppt',
      'discussion with the guide', 'dear faculty members', 'dear all students',
      'project submission date', 'assignment submission', 'lab submission',
      'report submission deadline', 'viva voce schedule', 'project presentation',
      'seminar presentation', 'internal assessment', 'mid semester exam',
      'end semester exam', 'attendance sheet', 'attendance record',
      'low attendance warning', 'attendance requirement', 'minimum attendance needed',
      'lecture schedule', 'tutorial schedule', 'lab schedule', 'office hours',
      'meet me in', 'office cabin', 'consultation hours', 'project guidance meeting',
      'thesis guidance', 'research discussion', 'data uploaded on portal',
      'check your attendance', 'verify attendance', 'mark attendance',
      'attendance short list', 'students with low attendance',
      'submit before', 'last date for submission',
      'late submission will not be accepted',
      'strictly adhere to deadline', 'kindly submit',
      'please ensure submission', 'evaluation criteria',
      'grading scheme', 'attendance is mandatory',
      'minimum attendance required', 'students with attendance below',
      'meet me during office hours', 'doubt clearing session',
      'for any queries contact', 'please revert'
    ],
    exclusionKeywords: [
      'placement drive', 'job opportunity', 'nptel course', 'promotion offer',
      // Exclude promotional healthcare emails
      'promotions via', '\'promotions\' via', 'promotions via ug student group',
      'shardacare', 'healthcity', 'healthcare privilege', 'exclusive healthcare',
      'free screening camp', 'breast health screening', 'orthopaedic consultations',
      '50% off', 'flat discount', 'special offer', 'healthcare offer',
      'empowering women\'s health', 'free consultation', 'medical camp'
    ],
    patterns: {
      senderDomains: [
        'sharda.ac.in', 'cse.sharda.ac.in'
        // Note: ug.sharda.ac.in removed - it's used by Promotions category
      ],
      senderNames: [
        'Professor', 'Dr.', 'Assistant Professor', 'Associate Professor',
        'Asst. Prof.', 'Assoc. Prof.', 'Faculty', 'Lecturer',
        // Specific professor names
        'Nishant Gupta', 'Kanika Singla', 'Anubhava Srivastava', 'Kapil Kumar',
        'Preeti Sharma', 'Dr. Preeti Sharma',
        'Dr. Nishant Gupta', 'Dr. Kanika Singla', 'Dr. Anubhava Srivastava', 'Dr. Kapil Kumar',
        'nishant.gupta', 'kanika.singla', 'anubhava.srivastava', 'kapil.kumar',
        'preeti.sharma', 'preeti.sharma5'
      ],
      // Exclude promotional, event, and HOD senders from Professor category
      excludeNames: [
        '\'Promotions\' via', '\'Promotions\' via UG Student Group',
        'Promotions via', 'Promotions via UG Student Group',
        '\'What\'s Happening\' via', '\'What\'s Happening\' via Batch',
        '\'What\'s Happening\' via UG Student Group',
        'What\'s Happening via', 'Whats Happening via',
        'UG Student Group', 'ShardaCare', 'HealthCity', 'Team ShardaCare',
        'Batch 2022-2023', 'HOD CSE', 'HOD ECE', 'HOD ME', 'HOD CE', 'HOD EEE',
        'HOD IT', 'HOD AE', 'HOD', 'Head of Department', 'Head of Dept',
        'Department Head', 'Dept Head', 'HoD'
      ],
      excludeDomains: [
        'ug.group@ug.sharda.ac.in', 'batch2022-2023@ug.sharda.ac.in',
        'hod.cse@sharda.ac.in', 'hod.ece@sharda.ac.in', 'hod.me@sharda.ac.in',
        'hod.ce@sharda.ac.in', 'hod.eee@sharda.ac.in', 'hod.it@sharda.ac.in',
        'hod.ae@sharda.ac.in', 'hod.civil@sharda.ac.in', 'hod.chem@sharda.ac.in',
        'hod.bt@sharda.ac.in', 'hod.biotech@sharda.ac.in', 'hod.mba@sharda.ac.in',
        'hod.law@sharda.ac.in', 'hod.pharmacy@sharda.ac.in', 'hod.medical@sharda.ac.in',
        'hod.nursing@sharda.ac.in', 'hod.physiotherapy@sharda.ac.in'
      ],
      // Match patterns like "Dr. Nishant Gupta (CSE Associate Professor)"
      namePatterns: [
        /dr\.\s+[a-z]+\s+[a-z]+/i,  // Dr. FirstName LastName
        /\(.*(?:assistant|associate|professor|faculty).*\)/i,  // (Assistant Professor)
        /(?:assistant|associate)\s+professor/i  // Assistant Professor or Associate Professor
      ]
    }
  },
  
  'Other': {
    priority: 'normal',
    primaryKeywords: [
      // ServiceNow and similar systems that don't fit other categories
      'servicenow', 'service-now', 'nowlearning', 'service now university',
      'academic partnerships', 'certified application developer', 'cad certification',
      'past due', 'assigned to you', 'learning content',
      // OpenAI/ChatGPT keywords
      'chatgpt', 'openai', 'chat gpt', 'open ai', 'chatgpt go', 'chatgpt business',
      'ai tools', 'advanced access', 'free for', 'upgrade now',
      // Google security notifications
      'google security', 'security alert', 'google account security', 'sign-in attempt',
      'new sign-in', 'suspicious activity', 'unusual activity', 'account activity',
      'security notification', 'google security alert', 'account security',
      'sign-in blocked', 'password changed', 'account recovery', 'security checkup',
      'two-factor authentication', '2-step verification', 'verification code',
      'device sign-in', 'new device', 'unrecognized device', 'login attempt',
      'privacy reminder', 'security update', 'account access', 'suspicious sign-in',
      // GitHub notifications
      'github', 'github.com', 'secrets detected', 'valid secrets', 'security alert',
      'repository', 'repo', 'github security', 'github support',
      // GeeksforGeeks
      'geeksforgeeks', 'geeks for geeks', 'gfg', 'geeksforgeeks.org',
      // Canva
      'canva', 'canva.com', 'templates', 'design', 'canva pro'
    ],
    secondaryKeywords: [
      // Generic system notifications
      'system notification', 'automated message', 'no-reply', 'do not reply',
      'system generated', 'auto-generated', 'unclassified', 'uncategorized',
      // ChatGPT/OpenAI related
      'chatgpt team', 'openai team', 'noreply@email.openai.com',
      'extended file uploads', 'image creation', 'longer memory',
      'try chatgpt', 'free for 12 months', 'chatgpt logo',
      // Google security related
      'google', 'gmail security', 'account security', 'security',
      'alert', 'notification', 'sign-in', 'login', 'authentication',
      'verification', 'device', 'activity', 'suspicious', 'unusual',
      'blocked', 'access', 'password', 'recovery', 'checkup',
      'privacy', 'update', 'reminder', 'attempt', 'recognized',
      'unrecognized', 'new', 'recent', 'activity', 'location',
      'ip address', 'browser', 'app', 'device', 'security code',
      'backup code', 'recovery email', 'security question',
      // GitHub related
      'github', 'repository', 'repo', 'commit', 'pull request', 'issue',
      'secrets', 'exposed secrets', 'valid secrets', 'secret detection',
      // GeeksforGeeks related
      'geeksforgeeks', 'gfg', 'coding', 'programming', 'course experience',
      'testimonial', 'linkedin post', 'zomato voucher', 't-shirt',
      // Canva related
      'canva', 'templates', 'design', 'graphic design', 'canva pro'
    ],
    phrases: [
      'service now university', 'service-now.com', 'servicenow.com',
      'academic partnerships certified', 'cad certification preparation',
      'assigned to you is past due', 'learning content has been assigned',
      'free chatgpt go for', 'chatgpt go for 12 months',
      'noreply@email.openai.com', 'email.openai.com',
      'upgrade now for advanced access', 'try chatgpt go free',
      'chatgpt business logo', 'unlock popular features',
      // Google security notification phrases
      'google security alert', 'security alert for your account',
      'new sign-in to your account', 'suspicious sign-in attempt',
      'unusual activity detected', 'sign-in from new device',
      'new device signed in', 'unrecognized sign-in attempt',
      'your password was changed', 'account recovery request',
      'security checkup reminder', 'privacy reminder from google',
      'two-factor authentication', '2-step verification code',
      'verify your identity', 'secure your account',
      'review your account activity', 'check your account security',
      'someone tried to sign in', 'sign-in was blocked',
      'account access notification', 'security update for your account',
      'google account security', 'gmail security notification',
      // GitHub notification phrases
      'possible valid secrets detected', 'secrets detected in',
      'github security alert', 'repository security', 'exposed secrets',
      'please resolve these alerts', 'rotate and revoke',
      // GeeksforGeeks phrases
      'geeksforgeeks', 'share your experience', 'gfg t-shirt',
      'zomato voucher', 'course experience', 'video testimonial',
      // Canva phrases
      'templates for your next design', 'new templates recommended',
      'canva pro', 'canva templates'
    ],
    exclusionKeywords: [],
    patterns: {
      senderDomains: [
        'service-now.com', 'servicenow.com', 'nowlearning.com',
        'signonmail.servicenow.com',
        'email.openai.com', 'openai.com', 'chatgpt.com',
        // Google security notification domains
        'accounts.google.com', 'mail.google.com', 'gmail.com',
        'google.com', 'googlemail.com', 'no-reply@accounts.google.com',
        'noreply@accounts.google.com', 'security-noreply@google.com',
        'accounts-noreply@google.com', 'google-noreply@google.com',
        // GitHub domains
        'github.com', 'githubusercontent.com', 'support@github.com',
        'noreply@github.com', 'notifications@github.com',
        // GeeksforGeeks domains
        'geeksforgeeks.org', 'geeksforgeeks.com', 'no-reply@geeksforgeeks.org',
        // Canva domains
        'canva.com', 'engage.canva.com', 'product@engage.canva.com'
      ],
      senderNames: [
        'ServiceNow University', 'ServiceNow', 'nowlearning',
        'ServiceNow Learning', 'ServiceNow Training',
        'ChatGPT', 'OpenAI', 'ChatGPT Team', 'OpenAI Team',
        // Google security notification senders
        'Google', 'Google Account', 'Google Security', 'Gmail Security',
        'Google Account Security', 'Security Alert', 'Google Notifications',
        'Account Security', 'Google Account Team', 'Security Team',
        // GitHub senders
        'GitHub', 'GitHub Support', 'GitHub Security', 'GitHub Notifications',
        // GeeksforGeeks senders
        'GeeksforGeeks', 'Geeks for Geeks', 'GfG', 'GeeksforGeeks Team',
        // Canva senders
        'Canva', 'Canva Team', 'Canva Pro', 'Canva Design'
      ]
    }
  }
}

// Category weights for scoring
export const CATEGORY_WEIGHTS = {
  'Placement': 1.3,
  'NPTEL': 1.4,
  'HOD': 1.4,
  'E-Zone': 1.5,
  'Promotions': 1.2,
  'Whats happening': 1.2,
  'Professor': 1.3,
  'Other': 0.5
}

// Scoring weights for different email parts
export const CONTENT_WEIGHTS = {
  subject: 2.0,      // Subject line matches get 2x weight
  snippet: 1.5,      // Snippet matches get 1.5x weight
  body: 1.0,         // Body matches get 1x weight
  phrase: 1.5,       // Phrase matches get 1.5x weight
  primaryKeyword: 1.2, // Primary keywords get 1.2x weight
  secondaryKeyword: 1.0 // Secondary keywords get 1.0x weight
}

export default KEYWORD_CATEGORIES
