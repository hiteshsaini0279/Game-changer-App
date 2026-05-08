/**
 * Seed script — creates demo user + 30 days of sample data
 * Run: node seed.js
 */
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User = require('./models/User')
const Daily = require('./models/Daily')
const DSA = require('./models/DSA')
const DevProject = require('./models/DevProject')
const Subject = require('./models/Subject')
const English = require('./models/English')

const TOPICS = ['Array', 'String', 'Tree', 'Graph', 'DP', 'Greedy', 'BinarySearch', 'Hashing']
const PLATFORMS = ['LeetCode', 'Codeforces', 'GeeksForGeeks']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const SUBJECTS = ['OOPS', 'DBMS', 'OS', 'CN']
const PROBLEMS = [
  'Two Sum', 'Best Time to Buy Stock', 'Contains Duplicate', 'Product of Array Except Self',
  'Maximum Subarray', 'Binary Search', 'Valid Parentheses', 'Merge Two Sorted Lists',
  'Invert Binary Tree', 'Diameter of Binary Tree', 'Climbing Stairs', 'Coin Change',
  'Longest Common Subsequence', 'Number of Islands', 'Course Schedule',
  'Lowest Common Ancestor', 'Word Search', 'Merge Intervals', 'Jump Game',
  'Unique Paths', 'House Robber', 'Decode Ways', 'Spiral Matrix',
  'Rotate Image', 'Group Anagrams', 'Top K Frequent Elements', 'Find Median from Data Stream',
  'Serialize and Deserialize BST', 'Alien Dictionary', 'Critical Connections'
]

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  // Clean existing demo data
  const existing = await User.findOne({ email: 'demo@180days.app' })
  if (existing) {
    await Promise.all([
      Daily.deleteMany({ user: existing._id }),
      DSA.deleteMany({ user: existing._id }),
      DevProject.deleteMany({ user: existing._id }),
      Subject.deleteMany({ user: existing._id }),
      English.deleteMany({ user: existing._id }),
      User.deleteOne({ _id: existing._id })
    ])
    console.log('🧹 Cleared existing demo data')
  }

  // Create demo user — start date 30 days ago
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 29)
  startDate.setHours(0, 0, 0, 0)

  const hashedPassword = await bcrypt.hash('demo123', 12)
  const user = await User.create({
    name: 'Arjun Sharma',
    email: 'demo@180days.app',
    password: hashedPassword,
    startDate,
    dailyDSATarget: 2,
    theme: 'dark'
  })
  console.log('👤 Demo user created:', user.email)

  // Create 30 daily entries
  const dailyEntries = []
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const completed = Math.random() > 0.2 // 80% completion rate
    const dsaCompleted = completed ? randInt(1, 4) : randInt(0, 1)
    dailyEntries.push({
      user: user._id,
      date,
      dayNumber: i + 1,
      dsaTarget: 2,
      dsaCompleted,
      developmentWork: completed ? ['Built REST API with JWT auth', 'Implemented Kanban board UI', 'Optimized MongoDB queries', 'Created React context for state', 'Added dark mode toggle'][i % 5] : '',
      coreSubject: completed ? rand(SUBJECTS) : 'None',
      coreSubjectTopic: completed ? ['Normalization', 'Process Scheduling', 'OSI Model', 'Inheritance'][i % 4] : '',
      englishPractice: Math.random() > 0.4,
      studyHours: completed ? randInt(3, 8) + Math.random() : randInt(0, 2),
      completed,
      mood: rand(['great', 'good', 'okay', 'bad']),
      notes: i % 5 === 0 ? 'Felt productive today. Nailed DP problems.' : ''
    })
  }
  await Daily.insertMany(dailyEntries)
  console.log('📅 30 daily entries created')

  // Create DSA problems
  const dsaProblems = PROBLEMS.map((name, i) => ({
    user: user._id,
    problemName: name,
    difficulty: i < 10 ? 'Easy' : i < 20 ? 'Medium' : 'Hard',
    platform: rand(PLATFORMS),
    topic: rand(TOPICS),
    solved: Math.random() > 0.15,
    revisionRequired: Math.random() > 0.7,
    timeTaken: randInt(10, 60),
    notes: i % 4 === 0 ? 'Good problem. Used sliding window approach.' : '',
    dayNumber: randInt(1, 30)
  }))
  await DSA.insertMany(dsaProblems)
  console.log('💻 30 DSA problems created')

  // Create dev projects
  await DevProject.insertMany([
    {
      user: user._id,
      projectName: '180 Days Tracker App',
      description: 'Full-stack productivity tracker for placement prep',
      techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      status: 'inprogress',
      priority: 'high',
      githubUrl: 'https://github.com/demo/180days',
      tasks: [
        { title: 'Setup backend API', status: 'done' },
        { title: 'Build dashboard UI', status: 'done' },
        { title: 'Add analytics charts', status: 'inprogress' },
        { title: 'Write unit tests', status: 'todo' },
        { title: 'Deploy to production', status: 'todo' }
      ]
    },
    {
      user: user._id,
      projectName: 'E-Commerce REST API',
      description: 'Scalable e-commerce backend with payment integration',
      techStack: ['Node.js', 'Express', 'MongoDB', 'Stripe'],
      status: 'completed',
      priority: 'medium',
      tasks: [
        { title: 'Product CRUD', status: 'done' },
        { title: 'User authentication', status: 'done' },
        { title: 'Payment gateway', status: 'done' },
        { title: 'Order management', status: 'done' }
      ]
    },
    {
      user: user._id,
      projectName: 'DSA Visualizer',
      description: 'Interactive algorithm visualization tool',
      techStack: ['React', 'D3.js', 'TypeScript'],
      status: 'planning',
      priority: 'low',
      tasks: [
        { title: 'Sorting algorithms UI', status: 'todo' },
        { title: 'Graph traversal visuals', status: 'todo' },
        { title: 'Tree animations', status: 'todo' }
      ]
    }
  ])
  console.log('🛠️  3 dev projects created')

  // Create subjects with topics
  const DEFAULT_TOPICS = {
    OOPS: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction', 'Interfaces', 'Abstract Classes', 'Design Patterns', 'SOLID Principles', 'Exception Handling'],
    DBMS: ['ER Diagrams', 'Normalization (1NF-BCNF)', 'SQL Queries', 'Joins', 'Transactions & ACID', 'Indexing', 'B-Trees', 'Concurrency Control', 'NoSQL Basics', 'CAP Theorem'],
    OS: ['Process Management', 'Threads', 'CPU Scheduling', 'Memory Management', 'Virtual Memory', 'Paging & Segmentation', 'File Systems', 'I/O Systems', 'Deadlocks', 'Semaphores & Mutex'],
    CN: ['OSI Model', 'TCP/IP Model', 'IP Addressing & Subnetting', 'DNS & DHCP', 'HTTP/HTTPS', 'TCP vs UDP', 'Routing Protocols', 'Network Security', 'Sockets', 'Load Balancing']
  }
  const coverageRates = { OOPS: 0.9, DBMS: 0.7, OS: 0.5, CN: 0.4 }
  await Subject.insertMany(SUBJECTS.map(s => ({
    user: user._id,
    subject: s,
    topics: DEFAULT_TOPICS[s].map(name => {
      const covered = Math.random() < coverageRates[s]
      return {
        name,
        covered,
        confidence: covered ? rand(['Low', 'Medium', 'High']) : 'Low',
        revisionStatus: covered ? 'done' : 'not_started'
      }
    })
  })))
  console.log('📚 4 subjects initialized')

  // Create English sessions
  const englishSessions = [
    { topic: 'Job Interview Simulation', type: 'Speaking', duration: 45, selfRating: 4,
      mistakes: ['Excessive use of "basically"', 'Spoke too fast when nervous'],
      improvedSentences: [{ wrong: 'I have did this project', correct: 'I have done this project' }],
      newWords: [{ word: 'Articulate', meaning: 'Express clearly and effectively' }] },
    { topic: 'Technical Vocabulary', type: 'Vocabulary', duration: 30, selfRating: 5,
      mistakes: [], newWords: [
        { word: 'Scalable', meaning: 'Capable of growing with demand' },
        { word: 'Latency', meaning: 'Time delay in data transfer' }
      ]},
    { topic: 'Email Writing for HR', type: 'Writing', duration: 40, selfRating: 3,
      mistakes: ['Informal tone in professional mail', 'Missing subject line clarity'] },
    { topic: 'Active Listening', type: 'Listening', duration: 60, selfRating: 4,
      notes: 'Watched 2 TED talks and summarized key points.' },
    { topic: 'Grammar — Tense Practice', type: 'Grammar', duration: 35, selfRating: 4,
      mistakes: ['Confusion with Present Perfect vs Simple Past'] }
  ]
  await English.insertMany(englishSessions.map((s, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i * 4)
    return { ...s, user: user._id, date: d }
  }))
  console.log('🗣️  5 English sessions created')

  console.log('\n✅ Seed complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:    demo@180days.app')
  console.log('🔑 Password: demo123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
