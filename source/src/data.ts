export interface Project {
  id: string
  number: string
  category: string
  title: string
  description: string
  chips: string[]
  mockType: 'gauge' | 'matrix' | 'chat'
}

export interface JourneyItem {
  year: string
  title: string
  org: string
}

export interface StatItem {
  label: string
  targetNumber: number
  prefix?: string
  suffix?: string
  decimals?: number
  note: string
}

export interface PlatformStat {
  platform: string
  value: string
  suffix: string
  label: string
  accent: 'red' | 'black'
}

export interface Certification {
  id: string
  title: string
  issuer: string
  date: string
}

export const PORTFOLIO_DATA = {
  personal: {
    fullName: "JYOTHI THOMAS",
    firstName: "JYOTHI",
    lastName: "THOMAS",
    roleLine1: "COMPUTER",
    roleLine2: "TEACHER.",
    experienceYears: "10+ Years",
    location: "Doha, Qatar",
    emailName: "jyothithomas1991",
    emailDomain: "@gmail.com",
    email: "jyothithomas1991@gmail.com",
    linkedinUrl: "https://linkedin.com/in/jyothithomas",
    resumeUrl: "./resume.pdf",
    copyrightYear: "2026",
    heroDescription:
      "Computer Science Educator empowering next-generation learners through modern AI curricula, foundational computational logic, and hands-on classroom technology.",
  },

  about: {
    manifestoWords: [
      { text: "I", highlight: false },
      { text: "bridge", highlight: false },
      { text: "deep", highlight: false },
      { text: "computational", highlight: true },
      { text: "logic", highlight: true },
      { text: "with", highlight: false },
      { text: "human-centred", highlight: false },
      { text: "pedagogy.", highlight: true },
      { text: "From", highlight: false },
      { text: "teaching", highlight: false },
      { text: "foundational", highlight: true },
      { text: "coding", highlight: true },
      { text: "in", highlight: false },
      { text: "modern", highlight: false },
      { text: "classrooms", highlight: true },
      { text: "to", highlight: false },
      { text: "designing", highlight: false },
      { text: "AI-based", highlight: true },
      { text: "curricula,", highlight: true },
      { text: "every", highlight: false },
      { text: "lesson", highlight: false },
      { text: "is", highlight: false },
      { text: "crafted", highlight: true },
      { text: "to", highlight: false },
      { text: "inspire", highlight: false },
      { text: "future", highlight: false },
      { text: "innovators", highlight: true },
      { text: "with", highlight: false },
      { text: "digital", highlight: true },
      { text: "mastery.", highlight: true },
    ],
    stats: [
      {
        label: "TEACHING EXPERIENCE",
        targetNumber: 10,
        suffix: "+ YRS",
        decimals: 0,
        note: "A decade of CS education & classroom leadership",
      },
      {
        label: "STUDENTS MENTORED",
        targetNumber: 1500,
        suffix: "+",
        decimals: 0,
        note: "CBSE coding clubs, expos & IT competitions",
      },
      {
        label: "ACADEMIC CGPA",
        targetNumber: 8.6,
        decimals: 1,
        note: "MTech in Computer Science",
      },
    ] as StatItem[],
  },

  projects: [
    {
      id: "ai-coding-lab",
      number: "01",
      category: "AI & PEDAGOGY",
      title: "AI LOGIC & CODING LAB",
      description: "Designed hands-on AI curricula and coding challenges focused on foundational logic and 21st-century digital tools.",
      chips: ["Python", "AI Curricula", "Logic Building", "Classroom Tech"],
      mockType: "gauge",
    },
    {
      id: "doc-control-system",
      number: "02",
      category: "DIGITAL ADMINISTRATION",
      title: "SMART DOC CONTROL ENGINE",
      description: "High-accuracy document control, multi-department invoice verification, digital filing, and database maintenance.",
      chips: ["MS Excel Advanced", "Database Systems", "Document Control", "Process Audit"],
      mockType: "matrix",
    },
    {
      id: "tech-expo-mentorship",
      number: "03",
      category: "STUDENT MENTORSHIP",
      title: "TECH EXPOS & CODING CLUBS",
      description: "Mentored student teams for CBSE coding competitions, intra-school IT expos, and faculty digital tool workshops.",
      chips: ["Coding Clubs", "CBSE Curriculum", "Lab Administration", "Faculty Training"],
      mockType: "chat",
    },
  ] as Project[],

  journey: {
    startYear: 2014,
    graduationYear: 2024,
    items: [
      {
        year: "2024–TILL DATE",
        title: "COMPUTER TEACHER",
        org: "Noble International School Qatar",
      },
      {
        year: "2021–2024",
        title: "COMPUTER TEACHER & TECH MENTOR",
        org: "Navajeevan Bethany Vidyalaya",
      },
      {
        year: "2015–2018",
        title: "GUEST LECTURER & COMPUTER TEACHER",
        org: "Kerala Distance Ed & Holy Trinity School",
      },
      {
        year: "2012–2014",
        title: "MTECH IN COMPUTER SCIENCE",
        org: "Ponjesly College of Engineering",
      },
    ] as JourneyItem[],
  },

  skills: [
    "Python",
    "Computer Science",
    "AI Curricula",
    "Logic Building",
    "MS Excel Advanced",
    "Google Workspace",
    "Database Systems",
    "Document Control",
    "Office Administration",
    "Data Entry & Audit",
    "CBSE Pedagogy",
    "IT Lab Management",
    "Coding Competitions",
    "Faculty Training",
    "Student Mentorship",
    "Digital Archiving",
  ],

  awards: {
    counters: [
      {
        platform: "EXPERIENCE",
        value: "10",
        suffix: "+ YRS",
        label: "CS EDUCATION & IT PEDAGOGY",
        accent: "red",
      },
      {
        platform: "ACADEMICS",
        value: "MTECH",
        suffix: " CS",
        label: "POSTGRADUATE DISTINCTION",
        accent: "black",
      },
      {
        platform: "MENTORSHIP",
        value: "1.5K",
        suffix: "+",
        label: "STUDENTS & EDUCATORS TRAINED",
        accent: "red",
      },
      {
        platform: "COMPETITIONS",
        value: "1ST",
        suffix: "★",
        label: "INTER-SCHOOL IT EXPO AWARDS",
        accent: "black",
      },
    ] as PlatformStat[],

    certifications: [
      {
        id: "c1",
        title: "COMPUTER TEACHER",
        issuer: "CBSE & International Curriculum",
        date: "Faculty Member (Doha, Qatar)",
      },
      {
        id: "c2",
        title: "MTECH COMPUTER SCIENCE",
        issuer: "Ponjesly College of Engineering",
        date: "Postgraduate Degree (2012–2014)",
      },
      {
        id: "c3",
        title: "BTECH INFORMATION TECH",
        issuer: "Ponjesly College of Engineering",
        date: "Undergraduate Degree (2008–2012)",
      },
      {
        id: "c4",
        title: "AI CURRICULUM & CODING",
        issuer: "St Rossello's Central School",
        date: "Advanced 21st-Century Pedagogy",
      },
      {
        id: "c5",
        title: "FACULTY DIGITAL TRAINING",
        issuer: "Navajeevan Bethany Vidyalaya",
        date: "Tech-Integrated Classroom Learning",
      },
      {
        id: "c6",
        title: "HIGHER CS LECTURESHIP",
        issuer: "Kerala Distance Education",
        date: "Capstone Project Mentorship",
      },
    ] as Certification[],
  },
}
