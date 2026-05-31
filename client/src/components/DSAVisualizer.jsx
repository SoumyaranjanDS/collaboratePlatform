import React, { useState, useRef } from 'react';
import { X, Play, SkipForward, RotateCcw, Layers, ArrowRightLeft, GitBranch } from 'lucide-react';

// ============= STACK VISUALIZER =============
const StackViz = () => {
  const [items, setItems] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [highlight, setHighlight] = useState(null);
  const [message, setMessage] = useState('Stack is empty. Push an element to start.');

  const push = () => {
    if (!inputVal.trim()) return;
    setItems(prev => [...prev, inputVal.trim()]);
    setHighlight(items.length);
    setMessage(`Pushed "${inputVal.trim()}" to top of stack`);
    setInputVal('');
    setTimeout(() => setHighlight(null), 600);
  };

  const pop = () => {
    if (items.length === 0) { setMessage('Stack Underflow! Nothing to pop.'); return; }
    setHighlight(items.length - 1);
    setMessage(`Popped "${items[items.length - 1]}" from top`);
    setTimeout(() => {
      setItems(prev => prev.slice(0, -1));
      setHighlight(null);
    }, 400);
  };

  const peek = () => {
    if (items.length === 0) { setMessage('Stack is empty!'); return; }
    setHighlight(items.length - 1);
    setMessage(`Peek: "${items[items.length - 1]}" is at the top`);
    setTimeout(() => setHighlight(null), 1000);
  };

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <div className="flex gap-2 flex-wrap w-full max-w-sm justify-center">
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && push()}
          placeholder="Value..." className="w-24 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]" />
        <button onClick={push} className="px-3 py-2 bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:opacity-80 transition-all">Push</button>
        <button onClick={pop} className="px-3 py-2 bg-[rgba(232,108,108,0.1)] text-[var(--color-functional-danger)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:opacity-80 transition-all">Pop</button>
        <button onClick={peek} className="px-3 py-2 bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:bg-[var(--color-bg-card)] transition-all border border-[var(--color-border-subtle)]">Peek</button>
      </div>

      <p className="text-[10px] font-bold text-slate-500 text-center h-4">{message}</p>

      <div className="flex-1 flex flex-col-reverse items-center justify-start gap-1.5 w-full max-w-[200px] relative">
        {/* Base */}
        <div className="w-full h-1.5 bg-slate-700 rounded-full" />
        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Bottom</span>

        {items.map((item, i) => (
          <div key={i} className={`w-full py-2.5 rounded-xl text-center text-[var(--text-sm)] font-black transition-all duration-300 ${
            highlight === i 
              ? (i === items.length - 1 ? 'bg-[var(--color-accent-primary)] text-white scale-105 shadow-[var(--shadow-sm)]' : 'bg-[var(--color-functional-danger)] text-white')
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]'
          }`}
            style={{ animation: highlight === i ? 'slideDown 0.3s ease-out' : 'none' }}
          >
            {item}
            {i === items.length - 1 && <span className="text-[8px] ml-2 opacity-50">← TOP</span>}
          </div>
        ))}

        {items.length === 0 && <div className="text-slate-700 text-xs font-bold mt-8">Empty Stack</div>}
      </div>
    </div>
  );
};

// ============= QUEUE VISUALIZER =============
const QueueViz = () => {
  const [items, setItems] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [highlight, setHighlight] = useState(null);
  const [message, setMessage] = useState('Queue is empty. Enqueue an element to start.');

  const enqueue = () => {
    if (!inputVal.trim()) return;
    setItems(prev => [...prev, inputVal.trim()]);
    setHighlight(items.length);
    setMessage(`Enqueued "${inputVal.trim()}" to rear`);
    setInputVal('');
    setTimeout(() => setHighlight(null), 600);
  };

  const dequeue = () => {
    if (items.length === 0) { setMessage('Queue is empty!'); return; }
    setHighlight(0);
    setMessage(`Dequeued "${items[0]}" from front`);
    setTimeout(() => {
      setItems(prev => prev.slice(1));
      setHighlight(null);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <div className="flex gap-2 flex-wrap w-full max-w-sm justify-center">
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && enqueue()}
          placeholder="Value..." className="w-24 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]" />
        <button onClick={enqueue} className="px-3 py-2 bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:opacity-80 transition-all">Enqueue</button>
        <button onClick={dequeue} className="px-3 py-2 bg-[rgba(232,108,108,0.1)] text-[var(--color-functional-danger)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:opacity-80 transition-all">Dequeue</button>
      </div>

      <p className="text-[10px] font-bold text-slate-500 text-center h-4">{message}</p>

      <div className="flex-1 flex items-center justify-center gap-2 w-full overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
        {items.length > 0 && <span className="text-[8px] text-accent-indigo font-black uppercase shrink-0">Front →</span>}
        
        {items.map((item, i) => (
          <div key={i} className={`shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-[var(--text-sm)] font-black transition-all duration-300 ${
            highlight === i 
              ? (i === 0 ? 'bg-[var(--color-functional-danger)] text-white scale-110 shadow-[var(--shadow-sm)]' : 'bg-[var(--color-accent-primary)] text-white scale-110 shadow-[var(--shadow-sm)]')
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]'
          }`}>
            {item}
          </div>
        ))}

        {items.length > 0 && <span className="text-[8px] text-slate-500 font-black uppercase shrink-0">← Rear</span>}
        {items.length === 0 && <div className="text-slate-700 text-xs font-bold">Empty Queue</div>}
      </div>
    </div>
  );
};

// ============= ARRAY VISUALIZER =============
const ArrayViz = () => {
  const [items, setItems] = useState([5, 12, 8, 3, 19, 7]);
  const [inputVal, setInputVal] = useState('');
  const [highlight, setHighlight] = useState(null);
  const [comparing, setComparing] = useState(null);
  const [message, setMessage] = useState('Click an element or use the controls below.');

  const insertEnd = () => {
    if (!inputVal.trim() || isNaN(inputVal)) return;
    setItems(prev => [...prev, Number(inputVal)]);
    setHighlight(items.length);
    setMessage(`Inserted ${inputVal} at index ${items.length}`);
    setInputVal('');
    setTimeout(() => setHighlight(null), 600);
  };

  const removeLast = () => {
    if (items.length === 0) return;
    setHighlight(items.length - 1);
    setMessage(`Removed ${items[items.length - 1]} from index ${items.length - 1}`);
    setTimeout(() => { setItems(prev => prev.slice(0, -1)); setHighlight(null); }, 400);
  };

  const linearSearch = async () => {
    const target = Number(inputVal);
    if (isNaN(target)) return;
    setMessage(`Searching for ${target}...`);
    for (let i = 0; i < items.length; i++) {
      setComparing(i);
      await new Promise(r => setTimeout(r, 400));
      if (items[i] === target) {
        setHighlight(i);
        setComparing(null);
        setMessage(`Found ${target} at index ${i}!`);
        setTimeout(() => setHighlight(null), 1500);
        return;
      }
    }
    setComparing(null);
    setMessage(`${target} not found in array.`);
  };

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <div className="flex gap-2 w-full max-w-sm flex-wrap justify-center">
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && insertEnd()}
          placeholder="Number..." className="w-20 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)]" />
        <button onClick={insertEnd} className="px-3 py-2 bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:opacity-80 transition-all">Insert</button>
        <button onClick={removeLast} className="px-3 py-2 bg-[rgba(232,108,108,0.1)] text-[var(--color-functional-danger)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:opacity-80 transition-all">Remove</button>
        <button onClick={linearSearch} className="px-3 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:bg-[var(--color-bg-card)] transition-all">Search</button>
      </div>

      <p className="text-[10px] font-bold text-slate-500 text-center h-4">{message}</p>

      <div className="flex-1 flex items-center justify-center gap-1.5 w-full overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-14 h-14 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-sm)] font-black transition-all duration-300 ${
              highlight === i ? 'bg-[rgba(93,187,138,0.2)] text-[var(--color-functional-success)] scale-110 shadow-[var(--shadow-sm)] border-2 border-[var(--color-functional-success)]'
              : comparing === i ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] scale-105 border-2 border-[var(--color-accent-primary)]'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]'
            }`}>
              {item}
            </div>
            <span className="text-[8px] text-slate-600 font-black">[{i}]</span>
          </div>
        ))}
        {items.length === 0 && <div className="text-slate-700 text-xs font-bold">Empty Array</div>}
      </div>
    </div>
  );
};

// ============= SORTING VISUALIZER =============
const SortingViz = () => {
  const [items, setItems] = useState(() => Array.from({ length: 20 }, () => Math.floor(Math.random() * 90) + 10));
  const [sorting, setSorting] = useState(false);
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [message, setMessage] = useState('Click Play to start sorting.');
  const cancelRef = useRef(false);

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const reset = () => {
    cancelRef.current = true;
    setSorting(false);
    setComparing([]);
    setSorted([]);
    setItems(Array.from({ length: 20 }, () => Math.floor(Math.random() * 90) + 10));
    setMessage('New array generated. Click Play to sort.');
    setTimeout(() => cancelRef.current = false, 100);
  };

  const bubbleSort = async (arr) => {
    const a = [...arr];
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        if (cancelRef.current) return;
        setComparing([j, j + 1]);
        setMessage(`Comparing index ${j} (${a[j]}) and ${j + 1} (${a[j + 1]})`);
        await delay(50);
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setItems([...a]);
        }
      }
      setSorted(prev => [...prev, a.length - 1 - i]);
    }
    setSorted(a.map((_, i) => i));
    setComparing([]);
    setMessage('Sorting complete!');
  };

  const selectionSort = async (arr) => {
    const a = [...arr];
    for (let i = 0; i < a.length; i++) {
      let minIdx = i;
      for (let j = i + 1; j < a.length; j++) {
        if (cancelRef.current) return;
        setComparing([minIdx, j]);
        setMessage(`Finding min: comparing ${a[minIdx]} with ${a[j]}`);
        await delay(50);
        if (a[j] < a[minIdx]) minIdx = j;
      }
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      setItems([...a]);
      setSorted(prev => [...prev, i]);
    }
    setSorted(a.map((_, i) => i));
    setComparing([]);
    setMessage('Sorting complete!');
  };

  const startSort = async () => {
    setSorting(true);
    setSorted([]);
    cancelRef.current = false;
    if (algorithm === 'bubble') await bubbleSort(items);
    else if (algorithm === 'selection') await selectionSort(items);
    setSorting(false);
  };

  const maxVal = Math.max(...items);

  return (
    <div className="flex flex-col items-center gap-4 h-full">
      <div className="flex gap-2 flex-wrap justify-center">
        <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} disabled={sorting}
          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none">
          <option value="bubble">Bubble Sort</option>
          <option value="selection">Selection Sort</option>
        </select>
        <button onClick={startSort} disabled={sorting} className="px-3 py-2 bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:opacity-80 transition-all disabled:opacity-30 flex items-center gap-1">
          <Play size={12} /> Play
        </button>
        <button onClick={reset} className="px-3 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-[var(--text-xs)] font-black uppercase rounded-lg hover:bg-[var(--color-bg-card)] transition-all flex items-center gap-1">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <p className="text-[10px] font-bold text-slate-500 text-center h-4">{message}</p>

      <div className="flex-1 flex items-end justify-center gap-[3px] w-full px-4">
        {items.map((val, i) => (
          <div key={i} className={`flex-1 max-w-4 rounded-t-[var(--radius-sm)] transition-all duration-100 ${
            sorted.includes(i) ? 'bg-[var(--color-functional-success)]'
            : comparing.includes(i) ? 'bg-[var(--color-accent-primary)] shadow-[var(--shadow-sm)]'
            : 'bg-gray-300'
          }`}
            style={{ height: `${(val / maxVal) * 100}%`, minHeight: '4px' }}
          />
        ))}
      </div>
    </div>
  );
};

// ============= MAIN VISUALIZER CONTAINER =============
const visualizers = [
  { id: 'stack', name: 'Stack', icon: Layers, component: StackViz },
  { id: 'queue', name: 'Queue', icon: ArrowRightLeft, component: QueueViz },
  { id: 'array', name: 'Array', icon: GitBranch, component: ArrayViz },
  { id: 'sorting', name: 'Sorting', icon: Play, component: SortingViz },
];

const DSAVisualizer = ({ onClose }) => {
  const [activeViz, setActiveViz] = useState('stack');
  const ActiveComponent = visualizers.find(v => v.id === activeViz)?.component;

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] animate-spring-in font-sans">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-[var(--color-accent-primary)]" />
          <h2 className="text-[var(--text-sm)] font-black uppercase tracking-widest text-[var(--color-text-primary)]">Visualizer</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] transition-all">
          <X size={16} />
        </button>
      </div>

      {/* DS Selector Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-[var(--color-border-subtle)]">
        {visualizers.map(v => (
          <button key={v.id} onClick={() => setActiveViz(v.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[var(--text-xs)] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeViz === v.id ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}>
            <v.icon size={12} />
            {v.name}
          </button>
        ))}
      </div>

      {/* Active Visualizer */}
      <div className="flex-1 p-4 overflow-hidden">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default DSAVisualizer;
