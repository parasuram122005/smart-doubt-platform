const mongoose = require('mongoose');
const KnowledgeEntry = require('../models/KnowledgeEntry');

const KNOWLEDGE_DATA = [
  // ═══════════════ DATA STRUCTURES & ALGORITHMS ═══════════════
  {
    question: "What is a linked list and how does it differ from an array?",
    answer: "A Linked List is a linear data structure where elements (nodes) are stored in non-contiguous memory locations. Each node contains data and a pointer/reference to the next node.\n\n**Key Differences from Arrays:**\n• **Memory**: Arrays use contiguous memory; linked lists use scattered memory connected by pointers.\n• **Insertion/Deletion**: O(1) in linked lists (at head) vs O(n) in arrays (shifting needed).\n• **Access**: Arrays support O(1) random access via index; linked lists require O(n) traversal.\n• **Size**: Linked lists grow dynamically; arrays have fixed or pre-allocated size.\n\n**Types**: Singly Linked List, Doubly Linked List, Circular Linked List.",
    subject: "Data Structures",
    tags: ["linked list", "array", "comparison", "dsa"]
  },
  {
    question: "What is a stack and what are its applications?",
    answer: "A Stack is a linear data structure following the **LIFO (Last In, First Out)** principle. Elements are added and removed from the same end called the 'top'.\n\n**Operations (all O(1)):**\n• `push(x)` — Add element to top\n• `pop()` — Remove top element\n• `peek()/top()` — View top element without removing\n• `isEmpty()` — Check if stack is empty\n\n**Applications:**\n• Function call management (Call Stack)\n• Expression evaluation and conversion (Infix to Postfix)\n• Undo/Redo operations in editors\n• Browser back/forward navigation\n• Balanced parentheses checking\n• DFS traversal in graphs",
    subject: "Data Structures",
    tags: ["stack", "lifo", "dsa"]
  },
  {
    question: "What is a queue and what are its types?",
    answer: "A Queue is a linear data structure following **FIFO (First In, First Out)** principle. Elements are added at the rear and removed from the front.\n\n**Operations:**\n• `enqueue(x)` — Add to rear\n• `dequeue()` — Remove from front\n• `front()` — View front element\n• `isEmpty()` — Check emptiness\n\n**Types:**\n• **Simple Queue** — Basic FIFO\n• **Circular Queue** — Last position connects back to first, avoids memory waste\n• **Priority Queue** — Elements served by priority, not insertion order\n• **Deque (Double-ended Queue)** — Insertion and deletion at both ends\n\n**Applications:** CPU scheduling, BFS traversal, printer spooling, IO buffers.",
    subject: "Data Structures",
    tags: ["queue", "fifo", "circular queue", "priority queue", "dsa"]
  },
  {
    question: "What is a binary search tree (BST)?",
    answer: "A Binary Search Tree (BST) is a binary tree data structure where each node has at most two children and satisfies the **BST property**:\n• Left subtree contains only nodes with keys **less than** the parent.\n• Right subtree contains only nodes with keys **greater than** the parent.\n\n**Time Complexities:**\n• Search: O(log n) average, O(n) worst case (skewed)\n• Insert: O(log n) average\n• Delete: O(log n) average\n\n**Operations:**\n• Inorder traversal gives sorted output\n• **Deletion cases**: Leaf node (just remove), one child (replace with child), two children (replace with inorder successor/predecessor)\n\n**Balanced BSTs** (AVL, Red-Black Trees) guarantee O(log n) for all operations.",
    subject: "Data Structures",
    tags: ["bst", "binary search tree", "tree", "dsa"]
  },
  {
    question: "Explain time complexity and Big O notation",
    answer: "**Time Complexity** measures how the runtime of an algorithm grows as input size increases.\n\n**Big O Notation** describes the upper bound (worst case) of growth rate:\n\n| Notation | Name | Example |\n|----------|------|---------|\n| O(1) | Constant | Array access by index |\n| O(log n) | Logarithmic | Binary Search |\n| O(n) | Linear | Linear Search |\n| O(n log n) | Linearithmic | Merge Sort, Quick Sort (avg) |\n| O(n²) | Quadratic | Bubble Sort, Selection Sort |\n| O(2ⁿ) | Exponential | Recursive Fibonacci |\n| O(n!) | Factorial | Permutation generation |\n\n**Rules:**\n• Drop constants: O(2n) → O(n)\n• Drop lower-order terms: O(n² + n) → O(n²)\n• Worst case is usually the focus",
    subject: "Data Structures",
    tags: ["time complexity", "big o", "algorithm analysis", "dsa"]
  },
  {
    question: "What is dynamic programming and how does it work?",
    answer: "**Dynamic Programming (DP)** is an optimization technique that solves complex problems by breaking them into overlapping subproblems and storing their results to avoid redundant computation.\n\n**Two Key Properties:**\n1. **Optimal Substructure** — Optimal solution can be built from optimal solutions of subproblems.\n2. **Overlapping Subproblems** — Same subproblems are solved multiple times.\n\n**Approaches:**\n• **Top-Down (Memoization)** — Recursive with caching. Start from the main problem, cache results.\n• **Bottom-Up (Tabulation)** — Iterative. Build solution from smallest subproblems up.\n\n**Classic Examples:**\n• Fibonacci Series: F(n) = F(n-1) + F(n-2)\n• 0/1 Knapsack Problem\n• Longest Common Subsequence (LCS)\n• Matrix Chain Multiplication\n• Coin Change Problem\n• Edit Distance",
    subject: "Data Structures",
    tags: ["dynamic programming", "dp", "memoization", "tabulation", "dsa"]
  },
  {
    question: "What are sorting algorithms and their complexities?",
    answer: "**Sorting algorithms** arrange elements in a specific order. Key algorithms:\n\n**Simple Sorts (O(n²)):**\n• **Bubble Sort** — Repeatedly swap adjacent elements. Stable. O(n²) avg/worst.\n• **Selection Sort** — Find minimum, place at beginning. Not stable. O(n²) always.\n• **Insertion Sort** — Insert each element in its correct position. Stable. O(n) best (nearly sorted).\n\n**Efficient Sorts (O(n log n)):**\n• **Merge Sort** — Divide and conquer. Stable. O(n log n) always. Uses O(n) extra space.\n• **Quick Sort** — Partition around pivot. Not stable. O(n log n) avg, O(n²) worst.\n• **Heap Sort** — Uses max/min heap. Not stable. O(n log n) always. In-place.\n\n**Special:**\n• **Counting Sort** — O(n+k) for integers in range k. Not comparison-based.\n• **Radix Sort** — O(nk) for k-digit numbers.",
    subject: "Data Structures",
    tags: ["sorting", "bubble sort", "merge sort", "quick sort", "dsa"]
  },
  {
    question: "What is a hash table and how does hashing work?",
    answer: "A **Hash Table** (Hash Map) stores key-value pairs using a hash function to compute an index into an array of slots.\n\n**How it works:**\n1. A **hash function** converts the key into an array index: `index = hash(key) % table_size`\n2. The value is stored at that index.\n3. Retrieval uses the same hash function.\n\n**Collision Handling:**\n• **Chaining** — Each slot contains a linked list of entries.\n• **Open Addressing** — Find next empty slot (Linear Probing, Quadratic Probing, Double Hashing).\n\n**Time Complexity:**\n• Average: O(1) for insert, delete, search\n• Worst: O(n) when all keys collide\n\n**Load Factor** = n/m (entries/table size). Rehashing occurs when load factor exceeds threshold (typically 0.75).",
    subject: "Data Structures",
    tags: ["hash table", "hashing", "collision", "dsa"]
  },
  {
    question: "What is a graph and what are graph traversal algorithms?",
    answer: "A **Graph** G = (V, E) consists of vertices (nodes) and edges (connections between nodes).\n\n**Types:**\n• Directed vs Undirected\n• Weighted vs Unweighted\n• Cyclic vs Acyclic (DAG — Directed Acyclic Graph)\n\n**Representations:**\n• **Adjacency Matrix** — 2D array, O(V²) space\n• **Adjacency List** — Array of lists, O(V+E) space (preferred for sparse graphs)\n\n**Traversal Algorithms:**\n\n**BFS (Breadth-First Search):**\n• Uses a Queue\n• Explores level by level\n• Finds shortest path in unweighted graphs\n• Time: O(V+E)\n\n**DFS (Depth-First Search):**\n• Uses a Stack (or recursion)\n• Explores as deep as possible before backtracking\n• Used in topological sort, cycle detection, connected components\n• Time: O(V+E)",
    subject: "Data Structures",
    tags: ["graph", "bfs", "dfs", "traversal", "dsa"]
  },
  {
    question: "What is a heap data structure?",
    answer: "A **Heap** is a complete binary tree that satisfies the heap property.\n\n**Types:**\n• **Max Heap** — Parent is always ≥ children. Root = maximum.\n• **Min Heap** — Parent is always ≤ children. Root = minimum.\n\n**Properties:**\n• Complete binary tree (filled level by level, left to right)\n• Can be efficiently stored in an array: parent at i, left child at 2i+1, right child at 2i+2\n\n**Operations:**\n• **Insert** — Add at end, bubble up. O(log n)\n• **Extract Max/Min** — Remove root, replace with last, heapify down. O(log n)\n• **Build Heap** — O(n) using bottom-up approach\n\n**Applications:**\n• Priority Queues\n• Heap Sort — O(n log n)\n• Dijkstra's shortest path algorithm\n• Finding Kth largest/smallest element",
    subject: "Data Structures",
    tags: ["heap", "max heap", "min heap", "priority queue", "dsa"]
  },

  // ═══════════════ OPERATING SYSTEMS ═══════════════
  {
    question: "What is a deadlock in operating systems?",
    answer: "A **Deadlock** is a situation where two or more processes are blocked forever, each waiting for a resource held by another.\n\n**Four Necessary Conditions (Coffman Conditions):**\n1. **Mutual Exclusion** — At least one resource is non-sharable.\n2. **Hold and Wait** — A process holds resources while waiting for others.\n3. **No Preemption** — Resources cannot be forcibly taken from a process.\n4. **Circular Wait** — A circular chain of processes exists, each waiting for a resource held by the next.\n\n**Handling Strategies:**\n• **Prevention** — Eliminate one of the four conditions.\n• **Avoidance** — Use algorithms like Banker's Algorithm to ensure safe states.\n• **Detection** — Use Resource Allocation Graphs (RAG) to detect cycles.\n• **Recovery** — Terminate processes or preempt resources.",
    subject: "Operating Systems",
    tags: ["deadlock", "os", "coffman conditions", "banker algorithm"]
  },
  {
    question: "What are CPU scheduling algorithms?",
    answer: "**CPU Scheduling** determines which process runs on the CPU at any given time.\n\n**Non-Preemptive Algorithms:**\n• **FCFS (First Come First Served)** — Processes executed in arrival order. Simple but causes convoy effect.\n• **SJF (Shortest Job First)** — Process with smallest burst time runs first. Optimal for avg waiting time but requires knowing burst time.\n\n**Preemptive Algorithms:**\n• **SRTF (Shortest Remaining Time First)** — Preemptive SJF. Currently running process can be interrupted.\n• **Round Robin (RR)** — Each process gets a fixed time quantum. Fair, widely used in time-sharing systems.\n• **Priority Scheduling** — Process with highest priority runs first. Can cause starvation (solved by aging).\n\n**Multi-Level Queue / Feedback Queue** — Multiple queues with different scheduling policies for different process types.",
    subject: "Operating Systems",
    tags: ["cpu scheduling", "fcfs", "sjf", "round robin", "os"]
  },
  {
    question: "What is virtual memory and paging?",
    answer: "**Virtual Memory** allows the execution of processes that may not be completely in physical memory. It creates an illusion of a large continuous memory space.\n\n**Paging:**\n• Physical memory is divided into fixed-size **frames**.\n• Logical memory is divided into same-size **pages**.\n• A **Page Table** maps logical page numbers to physical frame numbers.\n• **Page Size** is typically 4KB.\n\n**Page Fault:**\n1. Process accesses a page not in memory.\n2. OS traps (page fault interrupt).\n3. OS loads the page from disk to a free frame.\n4. Page table is updated.\n5. Process resumes.\n\n**Page Replacement Algorithms:**\n• **FIFO** — Replace oldest page\n• **LRU (Least Recently Used)** — Replace least recently accessed page\n• **Optimal** — Replace page that won't be used for the longest time (theoretical)\n\n**Thrashing** occurs when the system spends more time paging than executing.",
    subject: "Operating Systems",
    tags: ["virtual memory", "paging", "page fault", "lru", "os"]
  },
  {
    question: "What is a process and how does it differ from a thread?",
    answer: "A **Process** is a program in execution. It has its own memory space (code, data, stack, heap), program counter, and system resources.\n\n**Process States:** New → Ready → Running → Waiting → Terminated\n\nA **Thread** is the smallest unit of execution within a process. Multiple threads share the process's memory and resources.\n\n**Key Differences:**\n\n| Feature | Process | Thread |\n|---------|---------|--------|\n| Memory | Separate address space | Shared address space |\n| Creation | Expensive (fork) | Lightweight |\n| Communication | IPC (pipes, sockets) | Shared memory (direct) |\n| Context Switch | Slow (TLB flush) | Fast |\n| Crash Impact | Isolated | Can crash entire process |\n\n**Types of Threads:**\n• User-level threads (managed by user library)\n• Kernel-level threads (managed by OS)\n• Hybrid (many-to-many mapping)",
    subject: "Operating Systems",
    tags: ["process", "thread", "multithreading", "os"]
  },
  {
    question: "What are semaphores and mutex in operating systems?",
    answer: "**Semaphores** and **Mutex** are synchronization primitives used to prevent race conditions in concurrent programming.\n\n**Mutex (Mutual Exclusion Lock):**\n• Binary lock: locked or unlocked\n• Only the owner thread can unlock it\n• Used for protecting critical sections\n• `acquire()` / `release()` operations\n\n**Semaphore:**\n• Integer variable accessed via `wait(S)` (P) and `signal(S)` (V) operations atomically.\n• **Binary Semaphore** (0 or 1) — Similar to mutex\n• **Counting Semaphore** (0 to N) — Controls access to a resource with N instances\n\n**Key Difference:** A mutex has ownership (only the locker can unlock); a semaphore does not.\n\n**Classic Problems:**\n• Producer-Consumer (bounded buffer)\n• Readers-Writers problem\n• Dining Philosophers problem",
    subject: "Operating Systems",
    tags: ["semaphore", "mutex", "synchronization", "os"]
  },
  {
    question: "What is memory management in operating systems?",
    answer: "**Memory Management** is the OS function responsible for managing primary memory — allocating, tracking, and freeing memory for processes.\n\n**Techniques:**\n\n**Contiguous Allocation:**\n• **Fixed Partitioning** — Memory divided into fixed-size partitions. Causes internal fragmentation.\n• **Variable Partitioning** — Partitions sized to process needs. Causes external fragmentation.\n• **Allocation Strategies:** First Fit, Best Fit, Worst Fit\n\n**Non-Contiguous Allocation:**\n• **Paging** — Fixed-size pages/frames. No external fragmentation.\n• **Segmentation** — Variable-size segments based on logical divisions (code, data, stack).\n\n**Fragmentation:**\n• **Internal** — Wasted space within allocated memory block.\n• **External** — Enough total free memory but not contiguous. Solved by compaction.\n\n**Swapping:** Moving entire processes between main memory and disk.",
    subject: "Operating Systems",
    tags: ["memory management", "paging", "segmentation", "fragmentation", "os"]
  },
  {
    question: "What is the difference between multiprogramming, multitasking, and multiprocessing?",
    answer: "**Multiprogramming:**\n• Multiple programs loaded in memory simultaneously.\n• CPU switches to another program when the current one is waiting for I/O.\n• Goal: Maximize CPU utilization.\n• No user interaction during execution.\n\n**Multitasking (Time-Sharing):**\n• Extension of multiprogramming with rapid context switching.\n• CPU time is divided into small time slices (quantum).\n• Each process gets a turn, creating an illusion of simultaneous execution.\n• Enables interactive user sessions.\n\n**Multiprocessing:**\n• Multiple CPUs/cores execute processes truly in parallel.\n• **SMP (Symmetric)** — All processors are equal.\n• **AMP (Asymmetric)** — Master processor assigns tasks to others.\n\n**Multithreading:**\n• Multiple threads within a single process execute concurrently.\n• Shares process resources (memory, files).",
    subject: "Operating Systems",
    tags: ["multiprogramming", "multitasking", "multiprocessing", "os"]
  },

  // ═══════════════ DBMS ═══════════════
  {
    question: "What is normalization in DBMS?",
    answer: "**Normalization** is the process of organizing a relational database to reduce data redundancy and improve data integrity.\n\n**Normal Forms:**\n\n**1NF (First Normal Form):**\n• All attributes contain only atomic (indivisible) values.\n• Each column has a unique name.\n• No repeating groups.\n\n**2NF (Second Normal Form):**\n• Must be in 1NF.\n• No partial dependency — non-key attributes fully depend on the entire primary key.\n\n**3NF (Third Normal Form):**\n• Must be in 2NF.\n• No transitive dependency — non-key attributes don't depend on other non-key attributes.\n\n**BCNF (Boyce-Codd NF):**\n• Every determinant must be a candidate key.\n• Stricter version of 3NF.\n\n**Benefits:** Eliminates redundancy, prevents update/insert/delete anomalies.\n**Trade-off:** Over-normalization can increase join operations, reducing query performance.",
    subject: "Database Management Systems",
    tags: ["normalization", "1nf", "2nf", "3nf", "bcnf", "dbms"]
  },
  {
    question: "What are ACID properties in database transactions?",
    answer: "**ACID properties** ensure reliable processing of database transactions:\n\n**Atomicity:**\n• A transaction is \"all or nothing.\"\n• If any part fails, the entire transaction is rolled back.\n• Managed via transaction logs.\n\n**Consistency:**\n• A transaction brings the database from one valid state to another.\n• Integrity constraints are never violated.\n\n**Isolation:**\n• Concurrent transactions execute as if they are sequential.\n• One transaction's intermediate state is invisible to others.\n• **Isolation Levels:** Read Uncommitted, Read Committed, Repeatable Read, Serializable.\n\n**Durability:**\n• Once committed, changes persist even after system failure.\n• Ensured by writing to non-volatile storage (Write-Ahead Logging).\n\n**Example:** Bank transfer: debit from A and credit to B must both succeed or both fail (Atomicity), total money remains constant (Consistency).",
    subject: "Database Management Systems",
    tags: ["acid", "transaction", "atomicity", "isolation", "dbms"]
  },
  {
    question: "What is SQL and what are its different types of commands?",
    answer: "**SQL (Structured Query Language)** is the standard language for managing relational databases.\n\n**Command Categories:**\n\n**DDL (Data Definition Language):**\n• `CREATE` — Create tables, databases\n• `ALTER` — Modify table structure\n• `DROP` — Delete tables/databases\n• `TRUNCATE` — Remove all rows (faster than DELETE)\n\n**DML (Data Manipulation Language):**\n• `SELECT` — Retrieve data\n• `INSERT` — Add new records\n• `UPDATE` — Modify existing records\n• `DELETE` — Remove records\n\n**DCL (Data Control Language):**\n• `GRANT` — Give permissions\n• `REVOKE` — Remove permissions\n\n**TCL (Transaction Control Language):**\n• `COMMIT` — Save transaction changes\n• `ROLLBACK` — Undo changes\n• `SAVEPOINT` — Set rollback point\n\n**Key Clauses:** WHERE, GROUP BY, HAVING, ORDER BY, JOIN, LIMIT",
    subject: "Database Management Systems",
    tags: ["sql", "ddl", "dml", "dcl", "queries", "dbms"]
  },
  {
    question: "What are SQL joins and their types?",
    answer: "**SQL JOINs** combine rows from two or more tables based on a related column.\n\n**Types of Joins:**\n\n**INNER JOIN:**\n• Returns rows with matching values in both tables.\n• `SELECT * FROM A INNER JOIN B ON A.id = B.a_id`\n\n**LEFT (OUTER) JOIN:**\n• Returns all rows from the left table + matched rows from right.\n• Unmatched right-side columns show NULL.\n\n**RIGHT (OUTER) JOIN:**\n• Returns all rows from the right table + matched rows from left.\n\n**FULL (OUTER) JOIN:**\n• Returns all rows from both tables.\n• NULLs where there's no match on either side.\n\n**CROSS JOIN:**\n• Cartesian product — every row of A paired with every row of B.\n• Result size: |A| × |B|\n\n**SELF JOIN:**\n• A table joined with itself.\n• Useful for hierarchical data (e.g., employee-manager).",
    subject: "Database Management Systems",
    tags: ["join", "inner join", "left join", "sql", "dbms"]
  },
  {
    question: "What are database indexes and how do they work?",
    answer: "A **Database Index** is a data structure that improves the speed of data retrieval operations on a table at the cost of additional storage and write overhead.\n\n**How it works:**\n• Creates a sorted reference structure pointing to actual table rows.\n• Similar to a book's index — look up topic, get page number.\n\n**Types:**\n• **Primary Index** — On the primary key (clustered).\n• **Secondary Index** — On non-key attributes.\n• **Clustered Index** — Reorders the actual table data. Only one per table.\n• **Non-Clustered Index** — Separate structure pointing to data. Multiple allowed.\n• **B-Tree Index** — Most common. Balanced tree structure. O(log n) search.\n• **Hash Index** — Uses hash function. O(1) for exact match. No range queries.\n\n**When to use:** Frequently queried columns, JOIN columns, WHERE clause columns.\n**When to avoid:** Small tables, heavily updated columns, low-cardinality columns.",
    subject: "Database Management Systems",
    tags: ["index", "b-tree", "clustered", "database optimization", "dbms"]
  },
  {
    question: "What is the ER model in DBMS?",
    answer: "The **Entity-Relationship (ER) Model** is a conceptual data model used to represent the logical structure of a database.\n\n**Components:**\n\n**Entity:** A real-world object (e.g., Student, Course).\n• **Strong Entity** — Has its own primary key.\n• **Weak Entity** — Depends on a strong entity for identification.\n\n**Attributes:** Properties of entities.\n• Simple, Composite, Multivalued, Derived, Key attribute.\n\n**Relationships:** Associations between entities.\n• **One-to-One (1:1)** — Person ↔ Passport\n• **One-to-Many (1:N)** — Department → Employees\n• **Many-to-Many (M:N)** — Students ↔ Courses\n\n**ER Diagram Notation:**\n• Rectangles = Entities\n• Ellipses = Attributes\n• Diamonds = Relationships\n• Lines = Connections\n• Double rectangles = Weak entities",
    subject: "Database Management Systems",
    tags: ["er model", "entity relationship", "er diagram", "dbms"]
  },

  // ═══════════════ COMPUTER NETWORKS ═══════════════
  {
    question: "What is the OSI model and its layers?",
    answer: "The **OSI (Open Systems Interconnection) Model** is a 7-layer reference model for network communication.\n\n**Layers (bottom to top):**\n\n**1. Physical Layer:** Transmits raw bits over physical medium. Deals with cables, voltages, data rates.\n\n**2. Data Link Layer:** Reliable node-to-node delivery. Framing, MAC addressing, error detection (CRC). Switches operate here.\n\n**3. Network Layer:** Logical addressing (IP) and routing. Determines the best path. Routers operate here.\n\n**4. Transport Layer:** End-to-end delivery. TCP (reliable, connection-oriented) and UDP (unreliable, connectionless). Port numbers, segmentation, flow control.\n\n**5. Session Layer:** Manages sessions/connections between applications. Synchronization, dialog control.\n\n**6. Presentation Layer:** Data translation, encryption, compression. Converts data formats (JPEG, ASCII, SSL/TLS).\n\n**7. Application Layer:** User-facing services. HTTP, FTP, SMTP, DNS, DHCP.\n\n**Mnemonic:** Please Do Not Throw Sausage Pizza Away",
    subject: "Computer Networks",
    tags: ["osi model", "layers", "networking", "cn"]
  },
  {
    question: "What is TCP and how does it differ from UDP?",
    answer: "**TCP (Transmission Control Protocol)** and **UDP (User Datagram Protocol)** are Transport Layer protocols.\n\n**TCP:**\n• **Connection-oriented** — 3-way handshake (SYN → SYN-ACK → ACK)\n• **Reliable** — Guarantees delivery, ordering, and error checking\n• **Flow Control** — Sliding window mechanism\n• **Congestion Control** — Slow start, congestion avoidance\n• **Slower** due to overhead\n• **Use cases:** HTTP, FTP, Email, SSH\n\n**UDP:**\n• **Connectionless** — No handshake\n• **Unreliable** — No delivery guarantee, no ordering\n• **No flow/congestion control**\n• **Faster** and lower overhead\n• **Use cases:** DNS, Video streaming, Gaming, VoIP\n\n| Feature | TCP | UDP |\n|---------|-----|-----|\n| Connection | Yes | No |\n| Reliability | Guaranteed | Best-effort |\n| Ordering | Yes | No |\n| Speed | Slower | Faster |\n| Header Size | 20 bytes | 8 bytes |",
    subject: "Computer Networks",
    tags: ["tcp", "udp", "transport layer", "cn"]
  },
  {
    question: "What is HTTP and HTTPS?",
    answer: "**HTTP (HyperText Transfer Protocol)** is an application-layer protocol for transmitting hypermedia documents (web pages).\n\n**Key Features:**\n• **Stateless** — Each request is independent\n• **Request-Response model** — Client sends request, server responds\n• Port 80 (default)\n\n**HTTP Methods:**\n• `GET` — Retrieve resource\n• `POST` — Submit data\n• `PUT` — Update/replace resource\n• `DELETE` — Remove resource\n• `PATCH` — Partial update\n\n**Status Codes:**\n• 2xx — Success (200 OK, 201 Created)\n• 3xx — Redirection (301 Moved, 304 Not Modified)\n• 4xx — Client Error (400 Bad Request, 404 Not Found, 403 Forbidden)\n• 5xx — Server Error (500 Internal, 503 Unavailable)\n\n**HTTPS = HTTP + TLS/SSL:**\n• Encrypts data in transit\n• Uses certificates for authentication\n• Port 443\n• Prevents man-in-the-middle attacks",
    subject: "Computer Networks",
    tags: ["http", "https", "web", "application layer", "cn"]
  },
  {
    question: "What is DNS and how does it work?",
    answer: "**DNS (Domain Name System)** translates human-readable domain names (e.g., google.com) into IP addresses (e.g., 142.250.190.14).\n\n**Resolution Process:**\n1. Browser checks its **cache**.\n2. OS checks its **hosts file** and cache.\n3. Query sent to **Recursive Resolver** (ISP's DNS server).\n4. Resolver queries **Root DNS Server** → gets TLD server address.\n5. Queries **TLD Server** (.com, .org) → gets authoritative server.\n6. Queries **Authoritative DNS Server** → gets the actual IP.\n7. IP cached at each level and returned to client.\n\n**Record Types:**\n• **A** — Maps domain to IPv4\n• **AAAA** — Maps domain to IPv6\n• **CNAME** — Alias for another domain\n• **MX** — Mail server for the domain\n• **NS** — Nameserver for the domain\n• **TXT** — Arbitrary text (SPF, DKIM)\n\n**Uses port 53**, typically over UDP.",
    subject: "Computer Networks",
    tags: ["dns", "domain name", "resolution", "cn"]
  },
  {
    question: "What is subnetting and how to calculate subnet masks?",
    answer: "**Subnetting** divides a large network into smaller, manageable sub-networks (subnets).\n\n**Why Subnet?**\n• Reduce broadcast domain size\n• Improve security and performance\n• Efficient IP address utilization\n\n**Subnet Mask:** A 32-bit number that separates the network and host portions of an IP address.\n• Example: 255.255.255.0 = /24 (24 network bits, 8 host bits)\n\n**CIDR Notation:** IP/prefix_length (e.g., 192.168.1.0/24)\n\n**Calculation Example (192.168.1.0/26):**\n• /26 = 26 network bits, 6 host bits\n• Hosts per subnet: 2⁶ - 2 = 62 usable\n• Subnet mask: 255.255.255.192\n• Block size: 256 - 192 = 64\n• Subnets: 192.168.1.0, .64, .128, .192\n\n**IP Classes:**\n• Class A: /8, Class B: /16, Class C: /24\n• Private ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x",
    subject: "Computer Networks",
    tags: ["subnetting", "subnet mask", "cidr", "ip addressing", "cn"]
  },
  {
    question: "What is IP addressing and what are IPv4 vs IPv6?",
    answer: "**IP Address** is a unique numerical identifier assigned to each device on a network.\n\n**IPv4:**\n• 32-bit address (4 octets): 192.168.1.1\n• ~4.3 billion addresses (2³²)\n• Address exhaustion is a major issue\n• Uses NAT for address conservation\n• Header: 20-60 bytes\n\n**IPv6:**\n• 128-bit address: 2001:0db8:85a3::8a2e:0370:7334\n• ~340 undecillion addresses (2¹²⁸)\n• Built-in security (IPSec mandatory)\n• No NAT needed\n• Simplified header: 40 bytes fixed\n• Auto-configuration (SLAAC)\n\n**Special IPv4 Addresses:**\n• 127.0.0.1 — Loopback\n• 0.0.0.0 — Default/unspecified\n• 255.255.255.255 — Broadcast\n• 169.254.x.x — Link-local (APIPA)",
    subject: "Computer Networks",
    tags: ["ip address", "ipv4", "ipv6", "networking", "cn"]
  },

  // ═══════════════ OOP ═══════════════
  {
    question: "What are the four pillars of Object-Oriented Programming?",
    answer: "The **four pillars of OOP** are fundamental principles:\n\n**1. Encapsulation:**\n• Bundling data (attributes) and methods that operate on it into a single unit (class).\n• Hiding internal state using access modifiers (private, protected, public).\n• Provides controlled access via getters/setters.\n\n**2. Abstraction:**\n• Hiding complex implementation details, showing only essential features.\n• Achieved via abstract classes and interfaces.\n• Example: You use a car's steering wheel without knowing the internal mechanics.\n\n**3. Inheritance:**\n• Creating new classes from existing ones (parent → child).\n• Child class inherits attributes and methods of parent.\n• Promotes code reuse. Types: Single, Multiple, Multilevel, Hierarchical, Hybrid.\n\n**4. Polymorphism:**\n• \"Many forms\" — same interface, different implementations.\n• **Compile-time** (Method Overloading): Same name, different parameters.\n• **Runtime** (Method Overriding): Child class redefines parent's method. Uses dynamic dispatch.",
    subject: "Object Oriented Programming",
    tags: ["oop", "encapsulation", "abstraction", "inheritance", "polymorphism"]
  },
  {
    question: "What is inheritance in OOP and what are its types?",
    answer: "**Inheritance** allows a class (child/derived) to acquire properties and behaviors of another class (parent/base).\n\n**Types:**\n\n**1. Single Inheritance:**\n• One child extends one parent.\n• `class Dog extends Animal {}`\n\n**2. Multilevel Inheritance:**\n• Chain: Grandparent → Parent → Child\n• `class Puppy extends Dog extends Animal`\n\n**3. Hierarchical Inheritance:**\n• Multiple children extend one parent.\n• Dog, Cat both extend Animal.\n\n**4. Multiple Inheritance:**\n• Child extends multiple parents.\n• Not supported in Java/C# (diamond problem). Supported in C++, Python.\n• Java uses Interfaces to achieve similar effect.\n\n**5. Hybrid Inheritance:**\n• Combination of multiple types.\n\n**Diamond Problem:** When a class inherits from two classes that have a common ancestor, ambiguity arises about which parent's method to use. Resolved using virtual inheritance (C++) or interfaces (Java).",
    subject: "Object Oriented Programming",
    tags: ["inheritance", "oop", "diamond problem", "types"]
  },
  {
    question: "What is polymorphism in programming?",
    answer: "**Polymorphism** means \"many forms\" — the ability of objects to take multiple forms based on context.\n\n**Compile-Time Polymorphism (Static Binding):**\n\n**Method Overloading:**\n• Same method name, different parameter lists in the same class.\n```java\nint add(int a, int b) { return a + b; }\nfloat add(float a, float b) { return a + b; }\n```\n\n**Operator Overloading:**\n• Redefine operators for user-defined types (C++, Python).\n• `+` can add numbers or concatenate strings.\n\n**Runtime Polymorphism (Dynamic Binding):**\n\n**Method Overriding:**\n• Child class provides specific implementation of a method already defined in parent.\n• Decided at runtime based on actual object type.\n```java\nAnimal a = new Dog();\na.speak(); // Calls Dog's speak(), not Animal's\n```\n\n**Benefits:** Code flexibility, extensibility, cleaner interfaces, adherence to Open/Closed Principle.",
    subject: "Object Oriented Programming",
    tags: ["polymorphism", "overloading", "overriding", "oop"]
  },
  {
    question: "What is an abstract class and interface?",
    answer: "**Abstract Class:**\n• Cannot be instantiated (no objects directly).\n• Can have abstract methods (no body) AND concrete methods (with body).\n• Can have constructors, instance variables, any access modifiers.\n• A class can extend only one abstract class.\n• Used when classes share common behavior with some differences.\n\n**Interface:**\n• A contract specifying what methods a class must implement.\n• All methods are implicitly public and abstract (before Java 8).\n• Java 8+ allows `default` and `static` methods in interfaces.\n• A class can implement multiple interfaces.\n• Cannot have instance variables (only constants).\n\n**When to use which?**\n• **Abstract class:** When you want to share code among closely related classes.\n• **Interface:** When you want unrelated classes to implement the same capability.\n\n**Example:**\n• Abstract: `Vehicle` (shared start/stop methods)\n• Interface: `Flyable` (any class can implement: Bird, Airplane, Drone)",
    subject: "Object Oriented Programming",
    tags: ["abstract class", "interface", "oop", "java"]
  },

  // ═══════════════ WEB DEVELOPMENT ═══════════════
  {
    question: "What is REST API and RESTful architecture?",
    answer: "**REST (Representational State Transfer)** is an architectural style for designing networked applications.\n\n**Core Principles:**\n1. **Client-Server** — Separation of concerns\n2. **Stateless** — Each request contains all necessary information\n3. **Cacheable** — Responses must define cacheability\n4. **Uniform Interface** — Consistent resource identification and manipulation\n5. **Layered System** — Client doesn't know if it's talking to end server or intermediary\n\n**RESTful API Design:**\n• Resources identified by URIs: `/api/users/123`\n• HTTP methods map to CRUD operations:\n  - GET → Read\n  - POST → Create\n  - PUT → Update (full)\n  - PATCH → Update (partial)\n  - DELETE → Remove\n\n**Best Practices:**\n• Use nouns for endpoints, not verbs\n• Use proper status codes\n• Version your API (`/api/v1/users`)\n• Support pagination, filtering, sorting\n• Use JSON for request/response bodies",
    subject: "Web Development",
    tags: ["rest", "api", "restful", "http", "web"]
  },
  {
    question: "What is the difference between SQL and NoSQL databases?",
    answer: "**SQL (Relational) Databases:**\n• Structured schema with tables, rows, columns\n• Relationships via foreign keys and JOINs\n• ACID compliant\n• Examples: MySQL, PostgreSQL, Oracle, SQL Server\n• Query Language: SQL\n• Best for: Complex queries, transactions, structured data\n\n**NoSQL (Non-Relational) Databases:**\n• Flexible/dynamic schema\n• Designed for horizontal scaling\n• BASE model (Basically Available, Soft state, Eventually consistent)\n\n**Types of NoSQL:**\n• **Document Store:** JSON-like documents (MongoDB, CouchDB)\n• **Key-Value Store:** Simple pairs (Redis, DynamoDB)\n• **Column-Family:** Columns grouped (Cassandra, HBase)\n• **Graph Database:** Nodes and edges (Neo4j)\n\n**When to use SQL:** Fixed schema, complex transactions, data integrity critical.\n**When to use NoSQL:** Rapid development, large scale, flexible/unstructured data, high write throughput.",
    subject: "Database Management Systems",
    tags: ["sql", "nosql", "mongodb", "comparison", "dbms"]
  },
  {
    question: "What is the MVC architecture pattern?",
    answer: "**MVC (Model-View-Controller)** is a software design pattern that separates application logic into three interconnected components.\n\n**Model:**\n• Manages data and business logic\n• Interacts with the database\n• Notifies View of data changes\n• Independent of the user interface\n\n**View:**\n• Presents data to the user (UI)\n• Receives data from the Model\n• Sends user actions to the Controller\n• Can be HTML pages, templates, etc.\n\n**Controller:**\n• Handles user input/requests\n• Processes business logic\n• Updates Model and selects View\n• Acts as intermediary\n\n**Flow:** User → Controller → Model → Controller → View → User\n\n**Benefits:**\n• Separation of concerns\n• Parallel development\n• Code reusability\n• Easier testing and maintenance\n\n**Variations:** MVP (Model-View-Presenter), MVVM (Model-View-ViewModel)",
    subject: "Web Development",
    tags: ["mvc", "architecture", "design pattern", "web"]
  },

  // ═══════════════ MORE DSA ═══════════════
  {
    question: "What is recursion and how does it work?",
    answer: "**Recursion** is a technique where a function calls itself to solve a problem by breaking it into smaller subproblems.\n\n**Components:**\n1. **Base Case** — Condition to stop recursion (prevents infinite loop)\n2. **Recursive Case** — Function calls itself with a smaller input\n\n**Example — Factorial:**\n```\nfunction factorial(n) {\n  if (n <= 1) return 1;       // Base case\n  return n * factorial(n - 1); // Recursive case\n}\n```\n\n**How it works internally:**\n• Each call is pushed onto the **call stack**.\n• When base case is reached, calls return (unwind) in reverse order.\n• Stack overflow occurs if recursion is too deep (no base case or very large input).\n\n**Types:**\n• **Direct** — Function calls itself\n• **Indirect** — Function A calls B, B calls A\n• **Tail Recursion** — Recursive call is the last operation (can be optimized by compiler)\n\n**Recursion vs Iteration:** Recursion is elegant but uses more memory (stack). Iteration is often more efficient.",
    subject: "Data Structures",
    tags: ["recursion", "base case", "call stack", "dsa"]
  },
  {
    question: "What is the difference between BFS and DFS?",
    answer: "**BFS (Breadth-First Search)** and **DFS (Depth-First Search)** are fundamental graph/tree traversal algorithms.\n\n**BFS:**\n• Explores **level by level** (all neighbors first)\n• Uses a **Queue** data structure\n• Finds **shortest path** in unweighted graphs\n• Space: O(V) — stores entire level\n• Best for: Shortest path, level-order traversal, peer-to-peer networks\n\n**DFS:**\n• Explores **as deep as possible** before backtracking\n• Uses a **Stack** (or recursion)\n• Does NOT guarantee shortest path\n• Space: O(h) where h = height — more memory efficient\n• Best for: Topological sort, cycle detection, maze solving, connected components\n\n**Comparison:**\n| Feature | BFS | DFS |\n|---------|-----|-----|\n| Data Structure | Queue | Stack |\n| Strategy | Level by level | Go deep |\n| Shortest Path | Yes (unweighted) | No |\n| Memory | More (O(V)) | Less (O(h)) |\n| Completeness | Yes | Yes (finite graphs) |",
    subject: "Data Structures",
    tags: ["bfs", "dfs", "graph traversal", "comparison", "dsa"]
  },
  {
    question: "What is Dijkstra's algorithm?",
    answer: "**Dijkstra's Algorithm** finds the shortest path from a source vertex to all other vertices in a weighted graph with **non-negative edge weights**.\n\n**Algorithm Steps:**\n1. Initialize distances: source = 0, all others = ∞\n2. Create a min-priority queue with all vertices.\n3. While queue is not empty:\n   a. Extract vertex `u` with minimum distance.\n   b. For each neighbor `v` of `u`:\n      - If `dist[u] + weight(u,v) < dist[v]`:\n        - Update `dist[v] = dist[u] + weight(u,v)`\n        - Set predecessor of `v` to `u`\n\n**Time Complexity:**\n• With adjacency list + binary heap: O((V+E) log V)\n• With adjacency matrix: O(V²)\n\n**Limitations:**\n• Does NOT work with negative edge weights (use Bellman-Ford instead).\n• Greedy algorithm — once a node is processed, its distance is final.\n\n**Applications:** GPS navigation, network routing protocols (OSPF), social network analysis.",
    subject: "Data Structures",
    tags: ["dijkstra", "shortest path", "graph", "greedy", "dsa"]
  },

  // ═══════════════ MORE OS ═══════════════
  {
    question: "What is a file system in operating systems?",
    answer: "A **File System** organizes and manages how data is stored and retrieved on storage devices.\n\n**File System Functions:**\n• File creation, deletion, reading, writing\n• Directory management\n• Access control and permissions\n• Space allocation and free space management\n\n**Allocation Methods:**\n• **Contiguous** — Files stored in consecutive blocks. Fast sequential access. External fragmentation.\n• **Linked** — Each block points to next. No external fragmentation. Poor random access.\n• **Indexed** — Index block contains pointers to all file blocks. Supports direct access.\n\n**Common File Systems:**\n• **FAT32** — Simple, widely compatible, 4GB file size limit\n• **NTFS** — Windows default, journaling, ACLs, encryption\n• **ext4** — Linux default, journaling, large file support\n• **APFS** — Apple's modern file system, encryption, snapshots\n\n**Directory Structures:** Single-level, Two-level, Tree-structured, Acyclic graph.",
    subject: "Operating Systems",
    tags: ["file system", "storage", "allocation", "os"]
  },

  // ═══════════════ MORE DBMS ═══════════════
  {
    question: "What is a transaction in DBMS?",
    answer: "A **Transaction** is a logical unit of work consisting of one or more database operations that must be executed as a single, indivisible unit.\n\n**Transaction States:**\n1. **Active** — Transaction is executing\n2. **Partially Committed** — Final statement executed, awaiting commit\n3. **Committed** — Changes made permanent\n4. **Failed** — Error occurred, cannot proceed\n5. **Aborted** — Rolled back, database restored to previous state\n\n**Concurrency Control:**\n• **Locking Protocols:**\n  - Shared Lock (S) — For reading (multiple allowed)\n  - Exclusive Lock (X) — For writing (only one allowed)\n  - Two-Phase Locking (2PL) — Growing phase (acquire locks), Shrinking phase (release locks)\n\n• **Timestamp-Based:** Each transaction gets a unique timestamp, operations ordered accordingly.\n\n• **MVCC (Multi-Version Concurrency Control):** Maintains multiple versions of data. Readers don't block writers.\n\n**Serializability:** A schedule is serializable if its result equals some serial execution order.",
    subject: "Database Management Systems",
    tags: ["transaction", "concurrency", "locking", "serializability", "dbms"]
  },

  // ═══════════════ PROGRAMMING CONCEPTS ═══════════════
  {
    question: "What is the difference between compiled and interpreted languages?",
    answer: "**Compiled Languages:**\n• Source code is translated into machine code **before** execution by a compiler.\n• Entire program compiled at once.\n• Produces an executable file.\n• Faster execution (pre-compiled).\n• Platform-dependent executables.\n• Examples: C, C++, Go, Rust\n• Errors caught at compile time.\n\n**Interpreted Languages:**\n• Source code is translated **line by line** at runtime by an interpreter.\n• No separate compilation step.\n• No executable file generated.\n• Slower execution (runtime translation overhead).\n• Platform-independent (interpreter handles it).\n• Examples: Python, JavaScript, Ruby\n• Errors caught at runtime.\n\n**Hybrid Approach:**\n• **Java:** Compiled to bytecode (.class), then interpreted/JIT-compiled by JVM.\n• **Python:** Compiled to bytecode (.pyc), then interpreted by PVM.\n• **JIT (Just-In-Time):** Combines compilation and interpretation for optimized performance.\n\n**Trade-offs:** Compiled = faster execution, harder debugging. Interpreted = flexible, easier prototyping.",
    subject: "Programming",
    tags: ["compiled", "interpreted", "programming", "languages"]
  },
  {
    question: "What is version control and Git?",
    answer: "**Version Control** is a system that tracks changes to files over time, allowing multiple people to collaborate and revert to previous versions.\n\n**Git** is a distributed version control system created by Linus Torvalds.\n\n**Key Concepts:**\n• **Repository** — Project folder tracked by Git\n• **Commit** — Snapshot of changes with a message\n• **Branch** — Independent line of development\n• **Merge** — Combine branches\n• **Clone** — Copy remote repository locally\n• **Pull/Push** — Sync with remote\n\n**Essential Commands:**\n```\ngit init          # Initialize repo\ngit add .         # Stage all changes\ngit commit -m \"\" # Commit with message\ngit branch name   # Create branch\ngit checkout name # Switch branch\ngit merge name    # Merge branch\ngit pull          # Fetch + merge from remote\ngit push          # Push to remote\ngit log           # View commit history\ngit stash         # Temporarily save changes\n```\n\n**Branching Strategies:** GitFlow, GitHub Flow, Trunk-Based Development.",
    subject: "Programming",
    tags: ["git", "version control", "branching", "programming"]
  },
  {
    question: "What is cloud computing and its service models?",
    answer: "**Cloud Computing** delivers computing services (servers, storage, databases, networking, software) over the internet ('the cloud').\n\n**Service Models:**\n\n**IaaS (Infrastructure as a Service):**\n• Provides virtualized computing resources.\n• User manages: OS, middleware, applications.\n• Provider manages: Hardware, networking, storage.\n• Examples: AWS EC2, Azure VMs, Google Compute Engine.\n\n**PaaS (Platform as a Service):**\n• Provides platform for developing and deploying apps.\n• User manages: Application code and data.\n• Provider manages: OS, runtime, middleware, infrastructure.\n• Examples: Heroku, Google App Engine, Azure App Service.\n\n**SaaS (Software as a Service):**\n• Complete application delivered via browser.\n• User manages: Nothing technical.\n• Provider manages: Everything.\n• Examples: Gmail, Salesforce, Slack, Office 365.\n\n**Deployment Models:** Public, Private, Hybrid, Community Cloud.\n\n**Benefits:** Scalability, cost-efficiency (pay-per-use), reliability, global reach.",
    subject: "Computer Networks",
    tags: ["cloud computing", "iaas", "paas", "saas", "cn"]
  },
];

async function seedKnowledge() {
  const count = await KnowledgeEntry.countDocuments();
  if (count >= 30) {
    console.log(`Knowledge base already has ${count} entries. Seeding skipped.`);
    return;
  }

  try {
    // Clear any partial seed
    await KnowledgeEntry.deleteMany({});
    await KnowledgeEntry.insertMany(KNOWLEDGE_DATA);
    console.log(`✓ Knowledge base seeded with ${KNOWLEDGE_DATA.length} entries.`);
  } catch (error) {
    console.error('Knowledge base seeding failed:', error.message);
  }
}

module.exports = seedKnowledge;
