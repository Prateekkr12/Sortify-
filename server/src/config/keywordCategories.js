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
      'professional', 'industry', 'corporate', 'cv', 'portfolio', 'github',
      'leetcode', 'hackerrank', 'codechef', 'codeforces', 'aptitude', 'reasoning',
      'verbal', 'written test', 'online test', 'offline test', 'walk-in',
      'walk in', 'telephonic', 'phone interview', 'video call', 'zoom interview',
      'application form', 'registration', 'apply now', 'apply before', 'last date',
      'document verification', 'background check', 'joining date', 'notice period',
      'relocation', 'bengaluru', 'bangalore', 'pune', 'hyderabad', 'chennai',
      'mumbai', 'delhi', 'gurgaon', 'noida', 'jaipur', 'kolkata', 'tcs nqt',
      'capgemini', 'lti', 'mindtree', 'mphasis', 'hcl', 'tcs digital', 'tcs ninja',
      'infosys spec', 'infosys power', 'wipro elite', 'wipro turbo', 'co-cubes',
      'amcat', 'e-litmus', 'placement cell', 'tpo', 'training and placement'
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
      'walk-in interview', 'off-campus drive', 'on-campus drive'
    ],
    exclusionKeywords: [
      'nptel course', 'nptel exam', 'hod notice', 'professor email', 'academic course',
      'servicenow', 'service-now', 'nowlearning', 'service now university', 'academic partnerships',
      'certified application developer', 'cad certification', 'dr.', 'professor', 'assistant professor',
      'associate professor', 'faculty', 'hod', 'head of department'
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
        'service-now.com', 'servicenow.com', 'nowlearning.com'
      ],
      excludeNames: [
        'ServiceNow', 'ServiceNow University', 'nowlearning'
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
      'scmpro', 'star badges', 'lifelong learning'
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
      'iit madras nptel', 'swayam nptel platform'
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
        'Swayam NPTEL', 'Online Courses'
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
    priority: 'low',
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
      'reschedule evaluation date', 'meeting with hod', 'hod meeting'
    ],
    exclusionKeywords: ['placement drive', 'job opportunity', 'nptel course', 'promotion offer'],
    patterns: {
      senderDomains: [
        'sharda.ac.in', 'hod.cse@sharda.ac.in', 'cse.sharda.ac.in'
      ],
      senderNames: [
        'HOD', 'Head of Department', 'HOD CSE', 'Head CSE', 'Department Head',
        'Dept Head', 'HoD', 'Head of Dept', 'Dr. Sudeep Varshney'
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
      'login credentials', 'portal credentials', 'verification code'
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
      'portal maintenance scheduled', 'portal system update'
    ],
    exclusionKeywords: [
      'placement', 'nptel', 'job', 'interview',
      'chatgpt', 'openai', 'chat gpt', 'open ai', 
      'noreply@email.openai.com', 'email.openai.com'
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
        'email.openai.com', 'openai.com', 'chatgpt.com'
      ],
      excludeNames: [
        'ChatGPT', 'OpenAI', 'ChatGPT Team'
      ]
    }
  },
  
  'Promotions': {
    priority: 'high',
    primaryKeywords: [
      'offer', 'discount', 'deal', 'sale', 'promotion', 'marketing',
      'advertisement', 'unsubscribe', 'buy', 'limited time', 'special',
      'exclusive', 'save', 'buy now', 'campaign', 'promotional', 'promo',
      'flash sale', 'clearance sale', 'end of season', 'seasonal offer',
      'festival offer', 'holiday offer', 'anniversary sale', 'grand sale',
      'mega sale', 'super sale', 'big sale', 'huge discount', 'massive discount'
    ],
    secondaryKeywords: [
      'free screening camp', 'shardacare', 'healthcity',
      'breast health screening', 'breast cancer awareness', 'welcoming dr',
      'consultant', 'obstetrics', 'gynaecology', 'hosting',
      'delighted to welcome', 'extensive experience', 'promoting women\'s health',
      'early diagnosis', 'prevention', 'click', 'health checkup', 'medical camp',
      'free consultation', 'doctor consultation', 'health awareness', 'medical checkup',
      'preventive care', 'healthcare', 'medical services', 'hospital services',
      'clinic', 'diagnostic center', 'health center', 'wellness center',
      'health screening', 'body checkup', 'general checkup', 'full body checkup',
      'lab test', 'diagnostic test', 'blood test', 'health package',
      'healthcare package', 'medical package', 'checkup package'
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
      'shardacare healthcity', 'healthcare promotions', 'medical promotions'
    ],
    exclusionKeywords: ['placement drive', 'nptel course', 'hod notice', 'exam schedule'],
    patterns: {
      senderDomains: [
        'shardacare.com', 'healthcity.com', 'promo.com', 'marketing.com',
        'offers.com', 'deals.com', 'ug.sharda.ac.in'
      ],
      senderNames: [
        'Promotions', 'Offers', 'Marketing Team', 'ShardaCare', 'HealthCity',
        'Promotions Team', 'Marketing', 'Promotional'
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
      'social event', 'community event', 'university event', 'campus activity'
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
      'personality development', 'career guidance', 'counseling session'
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
      'volunteer opportunity', 'nss activity', 'nss program'
    ],
    exclusionKeywords: ['placement drive', 'job opportunity', 'nptel course', 'exam schedule'],
    patterns: {
      senderDomains: [
        'sharda.ac.in', 'ug.sharda.ac.in', 'events.sharda.ac.in',
        'dsw.sharda.ac.in', 'sgei.org'
      ],
      senderNames: [
        'What\'s Happening', 'Whats Happening', 'Events Team', 'DSW',
        'Student Affairs', 'Event Coordinator', 'Campus Events'
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
      // Specific professor names from emails
      'nishant gupta', 'kanika singla', 'anubhava srivastava', 'kapil kumar',
      'dr. nishant gupta', 'dr. kanika singla', 'dr. anubhava srivastava', 'dr. kapil kumar'
    ],
    secondaryKeywords: [
      'spreadsheet shared', 'outcome sheet', 'training session', 'oracle academy',
      'interview scheduled', 'shortlisted students', 'dear faculty', 'dear students',
      'kanika singla', 'anubhava srivastava', 'nishant gupta', 'kapil kumar',
      'computer science engineering', 'set assistant professor',
      'cse associate professor', 'sset assistant professor', 'check attendance',
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
      'attendance short list', 'students with low attendance'
    ],
    exclusionKeywords: ['placement drive', 'job opportunity', 'nptel course', 'promotion offer'],
    patterns: {
      senderDomains: [
        'sharda.ac.in', 'ug.sharda.ac.in', 'cse.sharda.ac.in'
      ],
      senderNames: [
        'Professor', 'Dr.', 'Assistant Professor', 'Associate Professor',
        'Asst. Prof.', 'Assoc. Prof.', 'Faculty', 'Lecturer',
        // Specific professor names
        'Nishant Gupta', 'Kanika Singla', 'Anubhava Srivastava', 'Kapil Kumar',
        'Dr. Nishant Gupta', 'Dr. Kanika Singla', 'Dr. Anubhava Srivastava', 'Dr. Kapil Kumar',
        'nishant.gupta', 'kanika.singla', 'anubhava.srivastava', 'kapil.kumar'
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
      'ai tools', 'advanced access', 'free for', 'upgrade now'
    ],
    secondaryKeywords: [
      // Generic system notifications
      'system notification', 'automated message', 'no-reply', 'do not reply',
      'system generated', 'auto-generated', 'unclassified', 'uncategorized',
      // ChatGPT/OpenAI related
      'chatgpt team', 'openai team', 'noreply@email.openai.com',
      'extended file uploads', 'image creation', 'longer memory',
      'try chatgpt', 'free for 12 months', 'chatgpt logo'
    ],
    phrases: [
      'service now university', 'service-now.com', 'servicenow.com',
      'academic partnerships certified', 'cad certification preparation',
      'assigned to you is past due', 'learning content has been assigned',
      'free chatgpt go for', 'chatgpt go for 12 months',
      'noreply@email.openai.com', 'email.openai.com',
      'upgrade now for advanced access', 'try chatgpt go free',
      'chatgpt business logo', 'unlock popular features'
    ],
    exclusionKeywords: [],
    patterns: {
      senderDomains: [
        'service-now.com', 'servicenow.com', 'nowlearning.com',
        'signonmail.servicenow.com',
        'email.openai.com', 'openai.com', 'chatgpt.com'
      ],
      senderNames: [
        'ServiceNow University', 'ServiceNow', 'nowlearning',
        'ServiceNow Learning', 'ServiceNow Training',
        'ChatGPT', 'OpenAI', 'ChatGPT Team', 'OpenAI Team'
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
