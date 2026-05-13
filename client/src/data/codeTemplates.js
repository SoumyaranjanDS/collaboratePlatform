const codeTemplates = [
  // ===== ARRAYS =====
  {
    id: 'arr-1',
    category: 'Array',
    title: 'Array Declaration',
    description: 'Initialize arrays in different ways',
    language: 'javascript',
    code: `// Array Declaration
const arr = [1, 2, 3, 4, 5];
const empty = new Array(10).fill(0);
const fromRange = Array.from({ length: 5 }, (_, i) => i + 1);`
  },
  {
    id: 'arr-2',
    category: 'Array',
    title: 'Array Methods',
    description: 'Common array operations',
    language: 'javascript',
    code: `const arr = [3, 1, 4, 1, 5];

arr.push(9);        // Add to end
arr.pop();           // Remove from end
arr.unshift(0);      // Add to start
arr.shift();         // Remove from start
arr.splice(2, 1);    // Remove at index 2
arr.includes(4);     // Check existence
arr.indexOf(1);      // Find index
arr.reverse();       // Reverse in-place
arr.sort((a, b) => a - b); // Sort ascending`
  },
  {
    id: 'arr-3',
    category: 'Array',
    title: 'Array Higher-Order Functions',
    description: 'map, filter, reduce, find',
    language: 'javascript',
    code: `const nums = [1, 2, 3, 4, 5];

const doubled = nums.map(n => n * 2);
const evens = nums.filter(n => n % 2 === 0);
const sum = nums.reduce((acc, n) => acc + n, 0);
const found = nums.find(n => n > 3);
const every = nums.every(n => n > 0);
const some = nums.some(n => n > 4);`
  },

  // ===== STACK =====
  {
    id: 'stk-1',
    category: 'Stack',
    title: 'Stack Implementation',
    description: 'Stack using array with push/pop/peek',
    language: 'javascript',
    code: `class Stack {
  constructor() {
    this.items = [];
  }
  push(val) { this.items.push(val); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

const stack = new Stack();
stack.push(10);
stack.push(20);
stack.pop();   // 20
stack.peek();  // 10`
  },
  {
    id: 'stk-2',
    category: 'Stack',
    title: 'Balanced Parentheses',
    description: 'Classic stack problem',
    language: 'javascript',
    code: `function isBalanced(str) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  
  for (const char of str) {
    if ('([{'.includes(char)) {
      stack.push(char);
    } else if (')]}'.includes(char)) {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}

isBalanced("({[]})"); // true
isBalanced("([)]");   // false`
  },

  // ===== QUEUE =====
  {
    id: 'que-1',
    category: 'Queue',
    title: 'Queue Implementation',
    description: 'Queue using array with enqueue/dequeue',
    language: 'javascript',
    code: `class Queue {
  constructor() {
    this.items = [];
  }
  enqueue(val) { this.items.push(val); }
  dequeue() { return this.items.shift(); }
  front() { return this.items[0]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

const q = new Queue();
q.enqueue("A");
q.enqueue("B");
q.dequeue(); // "A"
q.front();   // "B"`
  },
  {
    id: 'que-2',
    category: 'Queue',
    title: 'Priority Queue',
    description: 'Queue where elements have priority',
    language: 'javascript',
    code: `class PriorityQueue {
  constructor() { this.items = []; }

  enqueue(val, priority) {
    const entry = { val, priority };
    const idx = this.items.findIndex(i => i.priority > priority);
    if (idx === -1) this.items.push(entry);
    else this.items.splice(idx, 0, entry);
  }

  dequeue() { return this.items.shift()?.val; }
  peek() { return this.items[0]?.val; }
}

const pq = new PriorityQueue();
pq.enqueue("Low", 3);
pq.enqueue("High", 1);
pq.enqueue("Med", 2);
pq.dequeue(); // "High"`
  },

  // ===== LINKED LIST =====
  {
    id: 'll-1',
    category: 'Linked List',
    title: 'Singly Linked List',
    description: 'Node-based linked list with insert/delete',
    language: 'javascript',
    code: `class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

class LinkedList {
  constructor() { this.head = null; }

  append(val) {
    const node = new Node(val);
    if (!this.head) { this.head = node; return; }
    let curr = this.head;
    while (curr.next) curr = curr.next;
    curr.next = node;
  }

  delete(val) {
    if (!this.head) return;
    if (this.head.val === val) { this.head = this.head.next; return; }
    let curr = this.head;
    while (curr.next && curr.next.val !== val) curr = curr.next;
    if (curr.next) curr.next = curr.next.next;
  }

  print() {
    let curr = this.head, result = [];
    while (curr) { result.push(curr.val); curr = curr.next; }
    return result.join(" -> ");
  }
}`
  },

  // ===== TREE =====
  {
    id: 'tree-1',
    category: 'Tree',
    title: 'Binary Search Tree',
    description: 'BST with insert and search',
    language: 'javascript',
    code: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() { this.root = null; }

  insert(val) {
    const node = new TreeNode(val);
    if (!this.root) { this.root = node; return; }
    let curr = this.root;
    while (true) {
      if (val < curr.val) {
        if (!curr.left) { curr.left = node; break; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = node; break; }
        curr = curr.right;
      }
    }
  }

  search(val) {
    let curr = this.root;
    while (curr) {
      if (val === curr.val) return true;
      curr = val < curr.val ? curr.left : curr.right;
    }
    return false;
  }
}`
  },
  {
    id: 'tree-2',
    category: 'Tree',
    title: 'Tree Traversals',
    description: 'Inorder, Preorder, Postorder, BFS',
    language: 'javascript',
    code: `// Inorder (Left, Root, Right)
function inorder(node, result = []) {
  if (!node) return result;
  inorder(node.left, result);
  result.push(node.val);
  inorder(node.right, result);
  return result;
}

// Preorder (Root, Left, Right)
function preorder(node, result = []) {
  if (!node) return result;
  result.push(node.val);
  preorder(node.left, result);
  preorder(node.right, result);
  return result;
}

// BFS (Level Order)
function bfs(root) {
  if (!root) return [];
  const queue = [root], result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}`
  },

  // ===== SORTING =====
  {
    id: 'sort-1',
    category: 'Sorting',
    title: 'Bubble Sort',
    description: 'Simple comparison-based sort O(n²)',
    language: 'javascript',
    code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

bubbleSort([64, 34, 25, 12, 22, 11, 90]);
// [11, 12, 22, 25, 34, 64, 90]`
  },
  {
    id: 'sort-2',
    category: 'Sorting',
    title: 'Quick Sort',
    description: 'Divide and conquer sort O(n log n)',
    language: 'javascript',
    code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left = [], right = [];
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}

quickSort([38, 27, 43, 3, 9, 82, 10]);
// [3, 9, 10, 27, 38, 43, 82]`
  },
  {
    id: 'sort-3',
    category: 'Sorting',
    title: 'Merge Sort',
    description: 'Stable divide and conquer sort O(n log n)',
    language: 'javascript',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}`
  },

  // ===== SEARCHING =====
  {
    id: 'srch-1',
    category: 'Searching',
    title: 'Binary Search',
    description: 'Efficient search in sorted array O(log n)',
    language: 'javascript',
    code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1; // Not found
}

const sorted = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
binarySearch(sorted, 23); // 5`
  },

  // ===== GRAPH =====
  {
    id: 'grph-1',
    category: 'Graph',
    title: 'Graph (Adjacency List)',
    description: 'Graph with BFS and DFS',
    language: 'javascript',
    code: `class Graph {
  constructor() { this.adj = new Map(); }

  addVertex(v) { if (!this.adj.has(v)) this.adj.set(v, []); }
  addEdge(v, w) { this.adj.get(v).push(w); this.adj.get(w).push(v); }

  bfs(start) {
    const visited = new Set([start]);
    const queue = [start], result = [];
    while (queue.length) {
      const v = queue.shift();
      result.push(v);
      for (const n of this.adj.get(v)) {
        if (!visited.has(n)) { visited.add(n); queue.push(n); }
      }
    }
    return result;
  }

  dfs(start, visited = new Set(), result = []) {
    visited.add(start);
    result.push(start);
    for (const n of this.adj.get(start)) {
      if (!visited.has(n)) this.dfs(n, visited, result);
    }
    return result;
  }
}`
  },

  // ===== HASH MAP =====
  {
    id: 'hash-1',
    category: 'Hash Map',
    title: 'Hash Map / Object Patterns',
    description: 'Frequency counter and two-sum patterns',
    language: 'javascript',
    code: `// Frequency Counter
function charFrequency(str) {
  const freq = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  return freq;
}

// Two Sum (Hash Map approach)
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}

twoSum([2, 7, 11, 15], 9); // [0, 1]`
  },

  // ===== RECURSION =====
  {
    id: 'rec-1',
    category: 'Recursion',
    title: 'Classic Recursion Patterns',
    description: 'Factorial, Fibonacci, Power',
    language: 'javascript',
    code: `// Factorial
const factorial = n => n <= 1 ? 1 : n * factorial(n - 1);

// Fibonacci (with memoization)
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}

// Power
const power = (base, exp) => exp === 0 ? 1 : base * power(base, exp - 1);

factorial(5);  // 120
fib(10);       // 55
power(2, 10);  // 1024`
  },

  // ===== DYNAMIC PROGRAMMING =====
  {
    id: 'dp-1',
    category: 'Dynamic Programming',
    title: 'Climbing Stairs',
    description: 'Classic DP problem',
    language: 'javascript',
    code: `// How many ways to climb n stairs (1 or 2 steps at a time)
function climbStairs(n) {
  if (n <= 2) return n;
  const dp = [0, 1, 2];
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

climbStairs(5); // 8`
  },
  {
    id: 'dp-2',
    category: 'Dynamic Programming',
    title: 'Longest Common Subsequence',
    description: '2D DP table approach',
    language: 'javascript',
    code: `function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}

lcs("abcde", "ace"); // 3`
  },
];

export const categories = [...new Set(codeTemplates.map(t => t.category))];
export default codeTemplates;
