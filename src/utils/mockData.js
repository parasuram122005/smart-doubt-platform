export const MOCK_SUBJECTS = [
  { _id: 'sub1', subjectName: 'Data Structures', description: 'Advanced algorithms and structures' },
  { _id: 'sub2', subjectName: 'Linear Algebra', description: 'Matrix theory and vector spaces' },
  { _id: 'sub3', subjectName: 'Database Systems', description: 'SQL and relational modeling' },
  { _id: 'sub4', subjectName: 'Operating Systems', description: 'Process management and concurrency' }
];

export const MOCK_USERS = {
  admin: { _id: 'use-admin', name: 'Admin Master', role: 'admin', email: 'admin@uni.edu' },
  faculty1: { _id: 'fac1', name: 'Dr. Emily Chen', role: 'faculty', email: 'echen@uni.edu' },
  student1: { _id: 'stu1', name: 'Alex Johnson', role: 'student', email: 'alex@student.edu' },
  student2: { _id: 'stu2', name: 'Maria Davis', role: 'student', email: 'maria@student.edu' }
};

export const MOCK_DOUBTS = [
  {
    _id: 'db1',
    studentId: MOCK_USERS.student1,
    subjectId: MOCK_SUBJECTS[0],
    title: 'How do Red-Black trees self balance during massive insertions?',
    description: 'I understand the painting rules (red/black), but I am having trouble visualising the rotation cascades when inserting 10+ sequential nodes. Could you provide a step-by-step example?',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    _id: 'db2',
    studentId: MOCK_USERS.student2,
    subjectId: MOCK_SUBJECTS[1],
    title: 'Eigenvalues in non-diagonalizable matrices?',
    description: 'Is it true that a matrix is guaranteed to have eigenvalues even if it cannot be diagonalized? Does this tie into the Jordan normal form?',
    status: 'CLAIMED',
    facultyId: MOCK_USERS.faculty1,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
  },
  {
    _id: 'db3',
    studentId: MOCK_USERS.student1,
    subjectId: MOCK_SUBJECTS[2],
    title: 'Differences between B-Tree and B+Tree indexing?',
    description: 'Why do major RDMS like PostgreSQL default to B-Trees while others strictly say they use B+Trees? Does storing data strictly in leaves provide that big of a sequential read speedup?',
    status: 'SOLVED',
    facultyId: MOCK_USERS.faculty1,
    answer: 'Great question. The key difference is indeed the strict separation of keys and data. B+Trees only store values (or pointers to rows) in the leaf nodes, meaning the internal nodes are strictly for routing. This massively increases the "fan-out" factor of the tree, keeping the tree exceptionally shallow (often just 3-4 levels deep even for billions of rows). Sequential scans become trivial because the leaf nodes are linked in a continuous linked list. So yes, the range-query speedup is enormous.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'db4',
    studentId: MOCK_USERS.student2,
    subjectId: MOCK_SUBJECTS[3],
    title: 'Mutex lock priority inversion in real-time schedulers',
    description: 'How does the Mars Pathfinder bug relate to priority inversion, and what is the standard protocol to resolve it?',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8 hours ago
  }
];

export const MOCK_ADMIN_STATS = {
  users: { total: 4, students: 2, faculty: 1, admins: 1 },
  doubts: { total: 4, open: 2, claimed: 1, resolved: 1 },
  subjects: 4,
};

// Activity Timeline Mock Generation
export const getMockActivityTimeline = (doubts) => {
  return doubts.slice(0, 5).map(d => ({
    id: d._id + '-ev',
    type: d.status,
    title: d.title,
    user: d.status === 'SOLVED' || d.status === 'CLAIMED' ? d.facultyId?.name : d.studentId?.name,
    timestamp: d.updatedAt || d.createdAt
  }));
};

// Hybrid fallback utility
// If realData is empty (null, undefined, empty array or object with all 0s), return mockData
export const useHybridData = (realData, mockData) => {
  if (!realData) return mockData;
  if (Array.isArray(realData)) {
    return realData.length > 0 ? realData : mockData;
  }
  if (typeof realData === 'object') {
    // Basic check for empty object strings/keys or completely zeroed out stats object
    const values = Object.values(realData);
    if (values.length === 0) return mockData;
    // Specific check for default admin stats which usually returns 0 for everything initially if empty
    if (realData.doubts && realData.doubts.total === 0) return mockData;
    return realData;
  }
  return realData || mockData;
};
