export const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Consistency is the hallmark of the unimaginative.", author: "Oscar Wilde" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never came from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
]

export const getDailyQuote = () => {
  const idx = new Date().getDate() % MOTIVATIONAL_QUOTES.length
  return MOTIVATIONAL_QUOTES[idx]
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

export const getDaysSince = (startDate) => {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today - start) / 86400000) + 1
}

export const getWeekNumber = (dayNumber) => Math.ceil(dayNumber / 7)

export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const DSA_TOPICS = [
  'Array', 'String', 'LinkedList', 'Stack', 'Queue', 'Tree', 'Graph',
  'DP', 'Greedy', 'Backtracking', 'BinarySearch', 'Heap', 'Hashing',
  'Trie', 'Segment Tree', 'Math', 'Bit Manipulation', 'Two Pointer',
  'Sliding Window', 'Recursion', 'Other'
]

export const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'GeeksForGeeks', 'InterviewBit', 'CodeChef', 'Other']

export const SUBJECTS = ['OOPS', 'DBMS', 'OS', 'CN']

export const SUBJECT_COLORS = {
  OOPS: 'brand',
  DBMS: 'violet',
  OS: 'amber',
  CN: 'emerald'
}
