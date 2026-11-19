/* ===== Quizora - Online Examination & Evaluation System ===== */

// ---- Default Multi-Admin Accounts ----
const DEFAULT_ACCOUNTS = [
  {
    email: 'admin@quizora.com',
    name: 'Quizora Administrator',
    role: 'admin',
    password: 'admin123',
    examCode: 'QUIZ-TECH'
  },
  {
    email: 'admin@sies.ai',
    name: 'Senior HR Admin',
    role: 'admin',
    password: 'admin123',
    examCode: 'SIES-TECH'
  },
  {
    email: 'prof.sharma@college.edu',
    name: 'Prof. Sharma (CS Dept)',
    role: 'admin',
    password: 'prof123',
    examCode: 'SIES-CS101'
  },
  {
    email: 'candidate@example.com',
    name: 'Interview Candidate',
    role: 'candidate',
    password: 'cand123'
  }
];

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---- Supabase Cloud Client & Backend API ----
const SUPABASE_URL = "https://unkcmtcqyqdtrsqrabpp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_l4Q0M937eVmOmcdWwHfZWQ_3eSi1qzK";
const BACKEND_API_BASE = (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:'))
  ? (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api')
  : 'http://localhost:5000/api';

let sbClient = null;
try {
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase initialization error:", e);
}

function getTimeoutSignal(ms = 1500) {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
  } catch (e) { }
  return undefined;
}

// ---- Multi-Admin Seed Questions (Multiple Choice Questions) ----
const SEED_QUESTIONS = [
  // Admin 1 (admin@sies.ai - SIES-TECH)
  {
    id: 1,
    question: "Which keyword is used to declare a block-scoped variable that cannot be reassigned in JavaScript?",
    category: "Technical",
    difficulty: "Easy",
    type: "JavaScript",
    points: 10,
    options: ["var", "let", "const", "static"],
    correctAnswer: 2,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 2,
    question: "What is the primary purpose of the Virtual DOM in React?",
    category: "Technical",
    difficulty: "Medium",
    type: "React",
    points: 15,
    options: [
      "Directly manipulate the browser's real DOM elements without diffing",
      "Keep an in-memory representation to compute minimal and efficient real DOM updates",
      "Store relational database state on the server",
      "Compile JavaScript directly into machine bytecode"
    ],
    correctAnswer: 1,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 3,
    question: "In team project management, what is the best practice when encountering an unforeseen roadblock?",
    category: "HR",
    difficulty: "Medium",
    type: "Behavioral",
    points: 10,
    options: [
      "Conceal the delay until after the deadline has passed",
      "Communicate early with stakeholders, present impact analysis, and propose alternative solutions",
      "Abandon the deliverable without notifying team members",
      "Blame external dependencies exclusively"
    ],
    correctAnswer: 1,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 4,
    question: "What is a closure in JavaScript?",
    category: "Technical",
    difficulty: "Medium",
    type: "JavaScript",
    points: 15,
    options: [
      "A function that retains access to variables from its outer (lexical) scope even after outer execution completes",
      "A technique to automatically terminate running event loop threads",
      "A native method for compressing JSON objects",
      "A syntax error caused by unmatched braces"
    ],
    correctAnswer: 0,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 5,
    question: "Which HTTP method is considered idempotent and used to retrieve resources in a REST API?",
    category: "Technical",
    difficulty: "Easy",
    type: "Web Development",
    points: 10,
    options: ["POST", "GET", "CONNECT", "PATCH"],
    correctAnswer: 1,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 6,
    question: "When a technical disagreement occurs between two software engineers on a design choice, what is the recommended resolution?",
    category: "HR",
    difficulty: "Easy",
    type: "Behavioral",
    points: 10,
    options: [
      "Escalate immediately to the CEO without discussion",
      "Evaluate trade-offs objectively against project requirements, perform a POC if needed, and document the consensus",
      "Refuse collaboration until one developer yields",
      "Implement both architectures simultaneously in production"
    ],
    correctAnswer: 1,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 7,
    question: "What is the worst-case time complexity of standard QuickSort algorithm?",
    category: "Technical",
    difficulty: "Hard",
    type: "DSA",
    points: 20,
    options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: 2,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 8,
    question: "Which ACID property in relational databases guarantees that all operations within a transaction succeed or all fail?",
    category: "Technical",
    difficulty: "Medium",
    type: "Database",
    points: 15,
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctAnswer: 0,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 9,
    question: "What does the Single Responsibility Principle (SRP) in SOLID stand for?",
    category: "Technical",
    difficulty: "Hard",
    type: "OOP",
    points: 20,
    options: [
      "A class should only have one method",
      "A class or module should have one, and only one, reason to change",
      "Every project must only have one software engineer",
      "Services should never share memory across threads"
    ],
    correctAnswer: 1,
    adminEmail: "admin@sies.ai"
  },
  {
    id: 10,
    question: "Which architecture pattern involves breaking a system into independently deployable, loosely coupled services communicating via APIs?",
    category: "Technical",
    difficulty: "Hard",
    type: "Architecture",
    points: 20,
    options: [
      "Monolithic Architecture",
      "Microservices Architecture",
      "Peer-to-Peer Subnet",
      "Single-Threaded Serverless"
    ],
    correctAnswer: 1,
    adminEmail: "admin@sies.ai"
  },

  // Admin 2 (prof.sharma@college.edu - SIES-CS101)
  {
    id: 101,
    question: "What is the average time complexity of searching in a balanced Binary Search Tree (AVL / Red-Black Tree)?",
    category: "Technical",
    difficulty: "Hard",
    type: "DSA",
    points: 20,
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    adminEmail: "prof.sharma@college.edu"
  },
  {
    id: 102,
    question: "In relational database design, which Normal Form eliminates transitive dependencies on the primary key?",
    category: "Technical",
    difficulty: "Medium",
    type: "Database",
    points: 15,
    options: ["1NF", "2NF", "3NF", "BCNF exclusively"],
    correctAnswer: 2,
    adminEmail: "prof.sharma@college.edu"
  },
  {
    id: 103,
    question: "Which of the following is NOT one of Coffman's four conditions required for deadlock in operating systems?",
    category: "Technical",
    difficulty: "Hard",
    type: "Operating Systems",
    points: 20,
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption Permitted", "Circular Wait"],
    correctAnswer: 2,
    adminEmail: "prof.sharma@college.edu"
  },
  {
    id: 104,
    question: "How does TCP achieve reliable transmission compared to UDP?",
    category: "Technical",
    difficulty: "Medium",
    type: "Networks",
    points: 15,
    options: [
      "Using 3-way handshakes, sequence numbers, and packet acknowledgments (ACKs)",
      "By silently discarding corrupted packets without retransmission",
      "By broadcasting packets over unencrypted UDP channels",
      "By eliminating all checksum validation"
    ],
    correctAnswer: 0,
    adminEmail: "prof.sharma@college.edu"
  },
  {
    id: 105,
    question: "When working on collaborative academic or open-source software, how should external libraries and code be treated?",
    category: "HR",
    difficulty: "Easy",
    type: "Ethics",
    points: 10,
    options: [
      "Incorporate without attribution or license compliance",
      "Properly cite original authors, comply with open-source licenses, and document dependencies",
      "Delete copyright notices to keep code clean",
      "Claim third-party modules as proprietary creation"
    ],
    correctAnswer: 1,
    adminEmail: "prof.sharma@college.edu"
  },
  {
    id: 106,
    question: "What algorithmic strategy does Dijkstra's algorithm employ to determine the shortest path from a source node?",
    category: "Technical",
    difficulty: "Hard",
    type: "DSA",
    points: 20,
    options: [
      "Greedy Strategy with a Priority Queue",
      "Brute Force Backtracking",
      "Randomized Genetic Algorithm",
      "Divide and Conquer without memoization"
    ],
    correctAnswer: 0,
    adminEmail: "prof.sharma@college.edu"
  }
];

// ---- Multi-Admin Seed Results ----
const SEED_RESULTS = [
  // Results for Admin 1 (admin@sies.ai)
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav@example.com",
    date: "2026-02-10",
    overallScore: 82,
    technical: 85,
    hr: 78,
    communication: 83,
    status: "Passed",
    adminEmail: "admin@sies.ai",
    examCode: "SIES-TECH",
    questionResults: [
      {
        question: "Explain the difference between var, let, and const in JavaScript.",
        score: 90,
        feedback: "Strong grasp of lexical scoping, hoisting nuances, and temporal dead zone (TDZ).",
        answer: "var is function-scoped and hoisted with undefined. let and const are block-scoped and stay in the TDZ until declared. const cannot be reassigned."
      },
      {
        question: "What is the Virtual DOM and how does React optimize UI rendering?",
        score: 80,
        feedback: "Good explanation of reconciliation, diffing algorithm, and batching DOM updates.",
        answer: "The Virtual DOM is an in-memory lightweight representation of the real DOM. React diffs it to compute minimal actual mutations."
      }
    ]
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@example.com",
    date: "2026-02-09",
    overallScore: 91,
    technical: 93,
    hr: 88,
    communication: 92,
    status: "Passed",
    adminEmail: "admin@sies.ai",
    examCode: "SIES-TECH",
    questionResults: [
      {
        question: "Explain the concept of closures in JavaScript with a real-world use case.",
        score: 95,
        feedback: "Exceptional explanation with lexical scope closure, memory management, and practical memoization use cases.",
        answer: "A closure is a function bundled together with its lexical environment, allowing an inner function access to an outer function's scope even after the outer function has returned."
      },
      {
        question: "What are RESTful APIs and what architectural constraints do they follow?",
        score: 92,
        feedback: "Comprehensive knowledge of statelessness, HTTP verbs, idempotent operations, and uniform interface.",
        answer: "REST is an architectural style based on client-server separation, stateless requests, cacheability, uniform interface, and resource-oriented URI endpoints."
      }
    ]
  },
  {
    id: 3,
    name: "Rahul Verma",
    email: "rahul@example.com",
    date: "2026-02-08",
    overallScore: 56,
    technical: 48,
    hr: 65,
    communication: 55,
    status: "Failed",
    adminEmail: "admin@sies.ai",
    examCode: "SIES-TECH",
    questionResults: [
      {
        question: "Explain the difference between var, let, and const in JavaScript.",
        score: 50,
        feedback: "Basic definition provided, but missed block scoping and hoisting differences.",
        answer: "var and let are variables. const is constant and cannot change."
      }
    ]
  },

  // Results for Admin 2 (prof.sharma@college.edu)
  {
    id: 101,
    name: "Sneha Reddy",
    email: "sneha@example.com",
    date: "2026-02-07",
    overallScore: 84,
    technical: 86,
    hr: 82,
    communication: 80,
    status: "Passed",
    adminEmail: "prof.sharma@college.edu",
    examCode: "SIES-CS101",
    questionResults: [
      {
        question: "Explain time and space complexity of QuickSort vs MergeSort in best, average, and worst cases.",
        score: 88,
        feedback: "Accurate analysis of O(n log n) average vs O(n^2) worst case pivot selection.",
        answer: "QuickSort has O(n log n) average and O(n2) worst case when unbalanced. MergeSort is always O(n log n) with O(n) space."
      },
      {
        question: "Explain the SOLID principles in Object-Oriented Programming with code examples.",
        score: 84,
        feedback: "Solid understanding of Single Responsibility and Open/Closed principle.",
        answer: "SOLID represents Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion."
      }
    ]
  },
  {
    id: 102,
    name: "Vikram Singh",
    email: "vikram@example.com",
    date: "2026-02-06",
    overallScore: 68,
    technical: 70,
    hr: 65,
    communication: 69,
    status: "Review",
    adminEmail: "prof.sharma@college.edu",
    examCode: "SIES-CS101",
    questionResults: [
      {
        question: "Explain the differences between SQL and NoSQL databases regarding ACID vs BASE.",
        score: 70,
        feedback: "Satisfactory answer on relational tables vs documents, but lacked CAP theorem details.",
        answer: "SQL is relational with strict schemas and ACID compliance. NoSQL like MongoDB scales horizontally with BASE model."
      }
    ]
  },
  {
    id: 103,
    name: "Ananya Gupta",
    email: "ananya@example.com",
    date: "2026-02-05",
    overallScore: 92,
    technical: 94,
    hr: 90,
    communication: 91,
    status: "Passed",
    adminEmail: "prof.sharma@college.edu",
    examCode: "SIES-CS101",
    questionResults: [
      {
        question: "What is virtual memory and how does OS paging prevent external fragmentation?",
        score: 95,
        feedback: "Flawless explanation of MMU, page tables, TLB cache, and fixed-size frames eliminating external fragmentation.",
        answer: "Virtual memory decouples logical address space from physical RAM. Paging divides memory into fixed-sized blocks called frames, eliminating external fragmentation."
      }
    ]
  }
];

// ---- Keyword Banks for NLP-like scoring ----
const KEYWORDS = {
  JavaScript: ["function", "variable", "scope", "hoisting", "closure", "callback", "promise", "async", "prototype", "es6", "const", "let", "var", "arrow", "object", "array"],
  React: ["component", "state", "props", "virtual dom", "render", "hook", "usestate", "useeffect", "jsx", "lifecycle", "reconciliation", "fiber"],
  DSA: ["algorithm", "complexity", "sort", "search", "tree", "graph", "stack", "queue", "hash", "binary", "linked list", "recursion", "dynamic programming", "big o", "pivot", "merge", "partition"],
  Database: ["sql", "nosql", "query", "table", "index", "normalization", "schema", "join", "transaction", "acid", "mongodb", "relational", "document", "base", "cap"],
  OOP: ["class", "object", "inheritance", "polymorphism", "encapsulation", "abstraction", "interface", "solid", "single responsibility", "open closed", "liskov", "dependency", "inversion"],
  Architecture: ["microservice", "monolithic", "api", "gateway", "service", "scalab", "deploy", "container", "docker", "kubernetes", "load balancer", "decouple"],
  "Web Development": ["rest", "api", "http", "get", "post", "put", "delete", "endpoint", "resource", "stateless", "json", "status code", "url"],
  Behavioral: ["team", "challenge", "learn", "experience", "goal", "communicate", "collaborate", "problem", "solution", "leader", "manage", "improve", "growth"]
};

const POSITIVE_WORDS = ["excellent", "great", "good", "strong", "effective", "successful", "achieved", "improved", "innovative", "efficient", "productive", "proactive", "dedicated", "passionate", "skilled"];
const NEGATIVE_WORDS = ["bad", "poor", "weak", "failed", "struggle", "difficult", "unable", "confused", "problem", "issue"];

// ---- Multi-Admin Storage Initialization ----
function initApp() {
  // Accounts
  const storedAccounts = localStorage.getItem('sies_accounts');
  if (!storedAccounts || storedAccounts === '[]' || storedAccounts === 'null') {
    localStorage.setItem('sies_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
  } else {
    // Ensure default demo accounts exist
    try {
      const accounts = JSON.parse(storedAccounts);
      DEFAULT_ACCOUNTS.forEach(def => {
        if (!accounts.some(a => a.email.toLowerCase() === def.email.toLowerCase())) {
          accounts.push(def);
        }
      });
      localStorage.setItem('sies_accounts', JSON.stringify(accounts));
    } catch (e) { }
  }

  // Questions
  const existingQ = localStorage.getItem('sies_questions');
  if (!existingQ || existingQ === '[]' || existingQ === 'null') {
    localStorage.setItem('sies_questions', JSON.stringify(SEED_QUESTIONS));
  } else {
    try {
      const qs = JSON.parse(existingQ);
      // Ensure seed questions with adminEmail and MCQ options exist
      if (qs.length === 0 || !qs.some(q => q.adminEmail) || !qs.some(q => q.options && q.options.length)) {
        localStorage.setItem('sies_questions', JSON.stringify(SEED_QUESTIONS));
      }
    } catch (e) {
      localStorage.setItem('sies_questions', JSON.stringify(SEED_QUESTIONS));
    }
  }

  // Results
  const existingR = localStorage.getItem('sies_results');
  if (!existingR || existingR === '[]' || existingR === 'null') {
    localStorage.setItem('sies_results', JSON.stringify(SEED_RESULTS));
  } else {
    try {
      const rs = JSON.parse(existingR);
      if (rs.length === 0 || !rs.some(r => r.adminEmail)) {
        localStorage.setItem('sies_results', JSON.stringify(SEED_RESULTS));
      }
    } catch (e) {
      localStorage.setItem('sies_results', JSON.stringify(SEED_RESULTS));
    }
  }

  if (!localStorage.getItem('sies_nextId')) {
    localStorage.setItem('sies_nextId', '200');
  }
}

// ---- Accounts & Multi-Admin Helpers ----
function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem('sies_accounts') || '[]') || DEFAULT_ACCOUNTS;
  } catch (e) {
    return DEFAULT_ACCOUNTS;
  }
}

function saveAccount(acc) {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.email.toLowerCase() === acc.email.toLowerCase());
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], ...acc };
  } else {
    accounts.push(acc);
  }
  localStorage.setItem('sies_accounts', JSON.stringify(accounts));
  return acc;
}

function generateExamCode(name) {
  const clean = (name || 'QUIZ').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'QUIZ';
  const accounts = (typeof getAccounts === 'function') ? getAccounts() : [];
  const takenCodes = new Set(accounts.map(a => (a.examCode || a.exam_code || '').toUpperCase()).filter(Boolean));
  let code = '';
  let attempts = 0;
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    code = `${clean}-${num}`;
    attempts++;
  } while (attempts < 100 && takenCodes.has(code));
  return code;
}

function isSameAdminEmail(emailA, emailB) {
  const a = (emailA || '').trim().toLowerCase();
  const b = (emailB || '').trim().toLowerCase();
  if (a === b) return true;
  const masterAliases = ['admin@quizora.com', 'admin@sies.ai'];
  if (masterAliases.includes(a) && masterAliases.includes(b)) return true;
  return false;
}

function getCurrentUserEmail() {
  return (localStorage.getItem('sies_email') || 'admin@quizora.com').trim().toLowerCase();
}

function getCurrentUserRole() {
  return localStorage.getItem('sies_role') || 'candidate';
}

function getCurrentAdminExamCode() {
  const currentEmail = getCurrentUserEmail();
  const accounts = getAccounts();
  const found = accounts.find(a => a.email.toLowerCase() === currentEmail);
  if (found && found.examCode) {
    const code = found.examCode.trim().toUpperCase();
    // Enforce uniqueness: verify no collision with another registered instructor
    const collision = accounts.find(a =>
      a.email.toLowerCase() !== currentEmail &&
      (a.examCode || a.exam_code || '').toUpperCase() === code
    );
    if (!collision) {
      localStorage.setItem('sies_examCode', code);
      return code;
    }
    // If collision exists with another instructor, generate a fresh unique code for this instructor
    const uniqueCode = generateExamCode(found.name || 'INSTRUCTOR');
    found.examCode = uniqueCode;
    saveAccount(found);
    localStorage.setItem('sies_examCode', uniqueCode);
    return uniqueCode;
  }
  // Auto-generate if missing
  const newCode = generateExamCode(localStorage.getItem('sies_user') || 'ADMIN');
  if (found) {
    found.examCode = newCode;
    saveAccount(found);
  }
  localStorage.setItem('sies_examCode', newCode);
  return newCode;
}

function updateCurrentAdminExamCode(newCode) {
  if (!newCode || !newCode.trim()) return false;
  const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const currentEmail = getCurrentUserEmail();
  const accounts = getAccounts();
  const collision = accounts.find(a =>
    a.email.toLowerCase() !== currentEmail &&
    (a.examCode || a.exam_code || '').toUpperCase() === cleanCode
  );
  if (collision) {
    if (typeof showToast === 'function') {
      showToast(`Exam code "${cleanCode}" is already in use by another instructor.`, 'error');
    }
    return false;
  }
  const found = accounts.find(a => a.email.toLowerCase() === currentEmail);
  if (found) {
    found.examCode = cleanCode;
    saveAccount(found);
  }
  localStorage.setItem('sies_examCode', cleanCode);
  return cleanCode;
}

// Find an exam session by its shared student code (synchronous cache + local)
function getExamByCode(code) {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  const accounts = getAccounts();
  const admin = accounts.find(a => (a.examCode || a.exam_code || '').toUpperCase() === clean);
  if (!admin) return null;

  const questions = getQuestions(admin.email);
  return {
    adminName: admin.name,
    adminEmail: admin.email,
    examCode: clean,
    questions: questions.length > 0 ? questions : SEED_QUESTIONS.slice(0, 5)
  };
}

// Async exam lookup from Supabase cloud + backend API + local fallback
async function findExamByCode(code) {
  if (!code) return null;
  const clean = code.trim().toUpperCase();

  // 1. Try Supabase users table
  if (sbClient) {
    try {
      const { data, error } = await sbClient
        .from('users')
        .select('*')
        .or(`exam_code.eq.${clean},examCode.eq.${clean}`)
        .maybeSingle();

      if (!error && data) {
        saveAccount({
          name: data.name,
          email: data.email,
          role: data.role || 'admin',
          examCode: clean
        });
        const qs = await syncQuestionsFromSupabase(data.email);
        return {
          adminName: data.name,
          adminEmail: data.email,
          examCode: clean,
          questions: qs && qs.length > 0 ? qs : getQuestions(data.email)
        };
      }
    } catch (e) { }
  }

  // 2. Try Backend API
  try {
    const res = await fetch(`${BACKEND_API_BASE}/auth/exam/${encodeURIComponent(clean)}`, {
      signal: getTimeoutSignal(1200)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.exam) {
        saveAccount({
          name: json.exam.adminName,
          email: json.exam.adminEmail,
          role: 'admin',
          examCode: clean
        });
        const qs = getQuestions(json.exam.adminEmail);
        return {
          adminName: json.exam.adminName,
          adminEmail: json.exam.adminEmail,
          examCode: clean,
          questions: qs.length > 0 ? qs : SEED_QUESTIONS.slice(0, 5)
        };
      }
    }
  } catch (e) { }

  return getExamByCode(clean);
}

// ---- Real Authentication Helpers (Supabase + Cloud Sync) ----
function login(role, name, email, customExamCode) {
  const cleanEmail = (email || (role === 'admin' ? 'admin@sies.ai' : 'candidate@example.com')).trim().toLowerCase();
  const cleanName = name || (role === 'admin' ? 'Administrator' : 'Candidate');

  localStorage.setItem('sies_role', role);
  localStorage.setItem('sies_user', cleanName);
  localStorage.setItem('sies_email', cleanEmail);
  localStorage.setItem('sies_loggedin', 'true');
  localStorage.setItem('sies_token', 'token_' + Date.now());

  if (role === 'admin') {
    const accounts = getAccounts();
    let acc = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (acc) {
      if (customExamCode) {
        acc.examCode = customExamCode.trim().toUpperCase();
        saveAccount(acc);
      }
    } else {
      acc = {
        name: cleanName,
        email: cleanEmail,
        role: 'admin',
        examCode: customExamCode ? customExamCode.trim().toUpperCase() : generateExamCode(cleanName),
        password: 'pass' + Math.floor(100 + Math.random() * 900)
      };
      saveAccount(acc);

      // Create starter questions library for this new admin
      const allQ = getAllStoredQuestions();
      const starterQs = SEED_QUESTIONS.slice(0, 6).map((q, i) => ({
        ...q,
        id: Date.now() + i,
        adminEmail: cleanEmail
      }));
      allQ.push(...starterQs);
      localStorage.setItem('sies_questions', JSON.stringify(allQ));
    }
    localStorage.setItem('sies_examCode', acc.examCode);
  }
}

// Helper to prevent network promises from blocking the user experience
function withTimeout(promise, ms = 800) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
}

async function registerAccount(role, name, email, password, desiredExamCode) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const accounts = getAccounts();

  // 1. Instant check against local store (0ms)
  const existingLocal = accounts.find(a => a.email.toLowerCase() === cleanEmail);
  if (existingLocal) {
    if (existingLocal.password === password) {
      login(existingLocal.role || role, existingLocal.name || cleanName, cleanEmail, existingLocal.examCode);
      return { success: true, account: existingLocal, alreadyExisted: true };
    }
    return { success: false, message: 'An account with this email address already exists. Please Sign In.' };
  }

  let examCode = undefined;
  if (role === 'admin') {
    const raw = (desiredExamCode || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (raw) {
      examCode = raw;
      // 1. Check local accounts for code collision
      const localCollision = accounts.find(a =>
        (a.examCode || a.exam_code || '').toUpperCase() === examCode &&
        a.email.toLowerCase() !== cleanEmail
      );
      if (localCollision) {
        return {
          success: false,
          message: `The Exam Access Code "${examCode}" is already in use by another instructor. Each instructor must have a unique code.`
        };
      }

      // 2. Fast check with Backend API
      try {
        const checkRes = await fetch(`${BACKEND_API_BASE}/auth/exam/${encodeURIComponent(examCode)}`, {
          signal: getTimeoutSignal(600)
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData && checkData.success && checkData.exam && checkData.exam.adminEmail && checkData.exam.adminEmail.toLowerCase() !== cleanEmail) {
            return {
              success: false,
              message: `The Exam Access Code "${examCode}" is already in use by another instructor. Please choose a different code.`
            };
          }
        }
      } catch (e) { /* offline / timeout fallback */ }

      // 3. Fast check with Supabase if configured
      if (sbClient) {
        try {
          const { data: remoteCodeUsers } = await withTimeout(
            sbClient.from('users').select('id, email, exam_code').ilike('exam_code', examCode),
            600
          );
          if (remoteCodeUsers && remoteCodeUsers.length > 0 && remoteCodeUsers.some(u => (u.email || '').toLowerCase() !== cleanEmail)) {
            return {
              success: false,
              message: `The Exam Access Code "${examCode}" is already in use by another instructor. Please choose a unique code.`
            };
          }
        } catch (e) { }
      }
    } else {
      examCode = generateExamCode(cleanName);
    }
  }

  const newAcc = {
    name: cleanName,
    email: cleanEmail,
    role,
    password: password || 'pass123',
    examCode
  };

  // 2. Save locally and establish active session immediately (Instant!)
  saveAccount(newAcc);
  login(role, cleanName, cleanEmail, examCode);

  // 3. Asynchronously sync to Backend API in the background (Non-blocking)
  fetch(`${BACKEND_API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAcc),
    signal: getTimeoutSignal(1500)
  }).catch(() => { });

  // 4. Asynchronously sync to Supabase in the background (Non-blocking)
  if (sbClient) {
    withTimeout(
      sbClient.from('users').insert([{
        name: newAcc.name,
        email: newAcc.email,
        password: newAcc.password,
        role: newAcc.role,
        exam_code: examCode
      }]),
      1500
    ).catch(() => { });
  }

  return { success: true, account: newAcc };
}

async function authenticateUser(email, password, role) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  // 1. Instant check in local accounts (0ms response)
  const accounts = getAccounts();
  const localFound = accounts.find(a => a.email.toLowerCase() === cleanEmail);
  if (localFound) {
    if (localFound.password === password) {
      login(localFound.role || role, localFound.name, localFound.email, localFound.examCode || localFound.exam_code);
      return { success: true, user: localFound };
    } else {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }
  }

  // 2. Fast check against Backend API (< 15ms)
  try {
    const res = await fetch(`${BACKEND_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password, role }),
      signal: getTimeoutSignal(600)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.user) {
        login(json.user.role, json.user.name, json.user.email, json.user.examCode);
        saveAccount({ ...json.user, password });
        return { success: true, user: json.user };
      }
    }
  } catch (e) { }

  // 3. Fallback check to Supabase (capped at 600ms)
  if (sbClient) {
    try {
      const res = await withTimeout(
        sbClient
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .eq('password', password)
          .maybeSingle(),
        600
      );

      if (res && !res.error && res.data) {
        const userRole = res.data.role || role || 'admin';
        const userCode = res.data.exam_code || res.data.examCode;
        login(userRole, res.data.name, res.data.email, userCode);
        saveAccount({
          name: res.data.name,
          email: res.data.email,
          role: userRole,
          examCode: userCode,
          password: res.data.password
        });
        return { success: true, user: res.data };
      }
    } catch (e) { }
  }

  return {
    success: false,
    message: 'Account not found. Please click "Create Account" above to register.'
  };
}

function logout() {
  localStorage.removeItem('sies_role');
  localStorage.removeItem('sies_user');
  localStorage.removeItem('sies_email');
  localStorage.removeItem('sies_examCode');
  localStorage.removeItem('sies_loggedin');
  localStorage.removeItem('sies_token');
  window.location.href = 'login.html';
}

function isLoggedIn() {
  return localStorage.getItem('sies_loggedin') === 'true';
}

function getRole() {
  return localStorage.getItem('sies_role') || 'candidate';
}

function requireAuth(allowedRoles) {
  if (!isLoggedIn()) {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `login.html?returnUrl=${encodeURIComponent(page)}`;
    return false;
  }
  if (allowedRoles && !allowedRoles.includes(getRole())) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ---- Multi-Tenant Data Helpers (Isolated Per Admin) ----
function getAllStoredQuestions() {
  try {
    const data = JSON.parse(localStorage.getItem('sies_questions') || '[]');
    if (!Array.isArray(data) || data.length === 0) {
      localStorage.setItem('sies_questions', JSON.stringify(SEED_QUESTIONS));
      return SEED_QUESTIONS;
    }
    return data;
  } catch (e) {
    localStorage.setItem('sies_questions', JSON.stringify(SEED_QUESTIONS));
    return SEED_QUESTIONS;
  }
}

// Returns ONLY the questions owned by the specified admin (defaults to current admin)
function getQuestions(targetAdminEmail) {
  const adminEmail = (targetAdminEmail || getCurrentUserEmail()).toLowerCase();
  const all = getAllStoredQuestions();
  const adminQuestions = all.filter(q => isSameAdminEmail(q.adminEmail || 'admin@quizora.com', adminEmail));

  if (adminQuestions.length === 0) {
    // Seed this admin with starter questions
    const starterQs = SEED_QUESTIONS.slice(0, 6).map((q, i) => ({
      ...q,
      id: Date.now() + i,
      adminEmail
    }));
    all.push(...starterQs);
    localStorage.setItem('sies_questions', JSON.stringify(all));
    return starterQs;
  }
  return adminQuestions;
}

function saveQuestions(qs, targetAdminEmail) {
  const adminEmail = (targetAdminEmail || getCurrentUserEmail()).toLowerCase();
  let all = getAllStoredQuestions();
  // Remove existing questions for this admin, replace with new array
  all = all.filter(q => !isSameAdminEmail(q.adminEmail || 'admin@quizora.com', adminEmail));
  const tagged = qs.map(q => ({ ...q, adminEmail }));
  all.push(...tagged);
  localStorage.setItem('sies_questions', JSON.stringify(all));
}

function getAllStoredResults() {
  try {
    const data = JSON.parse(localStorage.getItem('sies_results') || '[]');
    if (!Array.isArray(data) || data.length === 0) {
      localStorage.setItem('sies_results', JSON.stringify(SEED_RESULTS));
      return SEED_RESULTS;
    }
    return data;
  } catch (e) {
    localStorage.setItem('sies_results', JSON.stringify(SEED_RESULTS));
    return SEED_RESULTS;
  }
}

// Returns ONLY candidate results belonging to this admin
function getResults(targetAdminEmail) {
  const adminEmail = (targetAdminEmail || getCurrentUserEmail()).toLowerCase();
  const all = getAllStoredResults();
  return all.filter(r => isSameAdminEmail(r.adminEmail || 'admin@quizora.com', adminEmail));
}

function saveResults(rs) {
  localStorage.setItem('sies_results', JSON.stringify(rs));
}

function getNextId() {
  const id = parseInt(localStorage.getItem('sies_nextId') || '300');
  localStorage.setItem('sies_nextId', String(id + 1));
  return id;
}

// ---- Cloud & API Sync (Multi-Tenant Aware) ----
async function syncQuestionsFromSupabase(targetAdminEmail) {
  const currentAdmin = targetAdminEmail || getCurrentUserEmail();
  try {
    const res = await fetch(`${BACKEND_API_BASE}/questions?adminEmail=${encodeURIComponent(currentAdmin)}`, {
      signal: getTimeoutSignal(1200)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        saveQuestions(json.data, currentAdmin);
        return json.data;
      }
    }
  } catch (e) { }

  if (!sbClient) return getQuestions(currentAdmin);
  try {
    let { data, error } = await sbClient
      .from('questions')
      .select('*')
      .or(`admin_email.eq.${currentAdmin},adminEmail.eq.${currentAdmin}`)
      .order('id', { ascending: true });

    if (error) {
      const fb = await sbClient.from('questions').select('*').order('id', { ascending: true });
      data = fb.data;
    }

    if (data && Array.isArray(data) && data.length > 0) {
      saveQuestions(data, currentAdmin);
      return data;
    }
  } catch (err) { }
  return getQuestions(currentAdmin);
}

async function saveQuestionToCloud(questionObj) {
  const currentAdmin = getCurrentUserEmail();
  questionObj.adminEmail = currentAdmin;
  questionObj.admin_email = currentAdmin;

  const localQuestions = getQuestions();
  const existingIdx = localQuestions.findIndex(q => q.id === questionObj.id);

  if (existingIdx >= 0) localQuestions[existingIdx] = questionObj;
  else {
    questionObj.id = questionObj.id || getNextId();
    localQuestions.push(questionObj);
  }
  saveQuestions(localQuestions, currentAdmin);

  // Sync to Backend API
  try {
    const isUpdate = existingIdx >= 0;
    const url = isUpdate ? `${BACKEND_API_BASE}/questions/${questionObj.id}` : `${BACKEND_API_BASE}/questions`;
    await fetch(url, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionObj),
      signal: getTimeoutSignal(1200)
    });
  } catch (e) { }

  // Sync to Supabase
  if (sbClient) {
    try {
      if (existingIdx >= 0) {
        const { id, created_at, ...updateFields } = questionObj;
        updateFields.admin_email = currentAdmin;
        await sbClient.from('questions').update(updateFields).eq('id', id);
      } else {
        const { id, created_at, ...insertFields } = questionObj;
        insertFields.admin_email = currentAdmin;
        await sbClient.from('questions').insert([insertFields]);
      }
    } catch (err) { }
  }

  return questionObj;
}

async function deleteQuestionFromCloud(id) {
  const currentAdmin = getCurrentUserEmail();
  const localQuestions = getQuestions().filter(q => q.id !== id);
  saveQuestions(localQuestions, currentAdmin);

  try {
    await fetch(`${BACKEND_API_BASE}/questions/${id}`, {
      method: 'DELETE',
      signal: getTimeoutSignal(1200)
    });
  } catch (e) { }

  if (sbClient) {
    try {
      await sbClient.from('questions').delete().eq('id', id);
    } catch (err) { }
  }
  return true;
}

async function syncResultsFromSupabase() {
  const currentAdmin = getCurrentUserEmail();
  try {
    const res = await fetch(`${BACKEND_API_BASE}/results?adminEmail=${encodeURIComponent(currentAdmin)}`, {
      signal: getTimeoutSignal(1200)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (e) { }

  if (!sbClient) return getResults();
  try {
    const { data, error } = await sbClient
      .from('results')
      .select('*')
      .or(`admin_email.eq.${currentAdmin},adminEmail.eq.${currentAdmin}`)
      .order('id', { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) { }
  return getResults();
}

async function addResultToCloud(resultObj) {
  const allResults = getAllStoredResults();
  allResults.unshift(resultObj);
  saveResults(allResults);
  localStorage.setItem('sies_lastResult', JSON.stringify(resultObj));

  // Sync to Backend API
  try {
    await fetch(`${BACKEND_API_BASE}/results/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateName: resultObj.name,
        candidateEmail: resultObj.email,
        adminEmail: resultObj.adminEmail,
        examCode: resultObj.examCode,
        answers: (resultObj.questionResults || []).map(qr => ({
          questionId: qr.questionId || qr.id || 0,
          question: qr.question,
          category: qr.category,
          answer: qr.answer || ''
        }))
      }),
      signal: getTimeoutSignal(1500)
    });
  } catch (e) { }

  if (sbClient) {
    try {
      const row = {
        name: resultObj.name,
        email: resultObj.email,
        date: resultObj.date,
        overallScore: resultObj.overallScore,
        technical: resultObj.technical,
        hr: resultObj.hr,
        communication: resultObj.communication,
        status: resultObj.status,
        admin_email: resultObj.adminEmail,
        adminEmail: resultObj.adminEmail,
        exam_code: resultObj.examCode,
        examCode: resultObj.examCode,
        questionResults: resultObj.questionResults || []
      };
      await sbClient.from('results').insert([row]);
    } catch (err) { }
  }

  return resultObj;
}

// ---- Objective Multiple-Choice Scoring Engine ----
function scoreAnswer(answer, question) {
  if (answer === undefined || answer === null || String(answer).trim().length === 0) {
    return {
      score: 0,
      isCorrect: false,
      feedback: "No option selected.",
      commScore: 0
    };
  }

  const options = question.options || [];
  const correctIdx = (typeof question.correctAnswer === 'number')
    ? question.correctAnswer
    : parseInt(question.correctAnswer || 0);

  let selectedIdx = -1;
  // If answer is a numeric index:
  if (!isNaN(answer) && String(answer).trim() !== '') {
    selectedIdx = parseInt(answer);
  } else {
    // If answer is option text, find its match
    selectedIdx = options.findIndex(opt => opt.trim().toLowerCase() === String(answer).trim().toLowerCase());
  }

  const isCorrect = (selectedIdx === correctIdx);
  const correctLetter = ['A', 'B', 'C', 'D'][correctIdx] || String(correctIdx + 1);
  const correctText = options[correctIdx] || `Option ${correctLetter}`;

  const selectedLetter = selectedIdx >= 0 && selectedIdx < 4 ? ['A', 'B', 'C', 'D'][selectedIdx] : '?';
  const selectedText = selectedIdx >= 0 && options[selectedIdx] ? options[selectedIdx] : String(answer);

  if (isCorrect) {
    return {
      score: 100,
      isCorrect: true,
      selectedOption: selectedIdx,
      correctOption: correctIdx,
      commScore: 100,
      feedback: `✓ Correct! Selected Option ${selectedLetter}: "${selectedText}".`
    };
  } else {
    return {
      score: 0,
      isCorrect: false,
      selectedOption: selectedIdx,
      correctOption: correctIdx,
      commScore: selectedIdx >= 0 ? 50 : 0,
      feedback: `✗ Incorrect. You selected Option ${selectedLetter}: "${selectedText}". The correct answer is Option ${correctLetter}: "${correctText}".`
    };
  }
}

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---- Navbar & Sidebar Controls ----
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== toggle) {
      sidebar.classList.remove('open');
    }
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initNavbar();
  initMobileMenu();
  initSidebar();
});
