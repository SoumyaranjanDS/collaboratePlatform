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
      <div className="flex gap-2 w-full max-w-xs">
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && push()}
          placeholder="Value..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-accent-indigo" />
        <button onClick={push} className="px-3 py-2 bg-accent-indigo/20 text-accent-indigo text-[10px] font-black uppercase rounded-lg hover:bg-accent-indigo/30 transition-all">Push</button>
        <button onClick={pop} className="px-3 py-2 bg-accent-red/20 text-accent-red text-[10px] font-black uppercase rounded-lg hover:bg-accent-red/30 transition-all">Pop</button>
        <button onClick={peek} className="px-3 py-2 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-lg hover:bg-white/10 transition-all">Peek</button>
      </div>

      <p className="text-[10px] font-bold text-slate-500 text-center h-4">{message}</p>

      <div className="flex-1 flex flex-col-reverse items-center justify-start gap-1.5 w-full max-w-[200px] relative">
        {/* Base */}
        <div className="w-full h-1.5 bg-slate-700 rounded-full" />
        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Bottom</span>

        {items.map((item, i) => (
          <div key={i} className={`w-full py-2.5 rounded-xl text-center text-sm font-black transition-all duration-300 ${
            highlight === i 
              ? (i === items.length - 1 ? 'bg-accent-indigo text-white scale-105 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-accent-red text-white')
              : 'bg-white/10 text-slate-300 border border-white/5'
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
      <div className="flex gap-2 w-full max-w-xs">
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && enqueue()}
          placeholder="Value..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-accent-indigo" />
        <button onClick={enqueue} className="px-3 py-2 bg-accent-indigo/20 text-accent-indigo text-[10px] font-black uppercase rounded-lg hover:bg-accent-indigo/30 transition-all">Enqueue</button>
        <button onClick={dequeue} className="px-3 py-2 bg-accent-red/20 text-accent-red text-[10px] font-black uppercase rounded-lg hover:bg-accent-red/30 transition-all">Dequeue</button>
      </div>

      <p className="text-[10px] font-bold text-slate-500 text-center h-4">{message}</p>

      <div className="flex-1 flex items-center justify-center gap-2 w-full overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
        {items.length > 0 && <span className="text-[8px] text-accent-indigo font-black uppercase shrink-0">Front →</span>}
        
        {items.map((item, i) => (
          <div key={i} className={`shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 ${
            highlight === i 
              ? (i === 0 ? 'bg-accent-red text-white scale-110 shadow-[0_0_20px_rgba(255,77,77,0.4)]' : 'bg-accent-indigo text-white scale-110 shadow-[0_0_20px_rgba(99,102,241,0.4)]')
              : 'bg-white/10 text-slate-300 border border-white/5'
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
          placeholder="Number..." className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-accent-indigo" />
        <button onClick={insertEnd} className="px-3 py-2 bg-accent-indigo/20 text-accent-indigo text-[10px] font-black uppercase rounded-lg hover:bg-accent-indigo/30 transition-all">Insert</button>
        <button onClick={removeLast} className="px-3 py-2 bg-accent-red/20 text-accent-red text-[10px] font-black uppercase rounded-lg hover:bg-accent-red/30 transition-all">Remove</button>
        <button onClick={linearSearch} className="px-3 py-2 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-lg hover:bg-white/10 transition-all">Search</button>
      </div>

      <p className="text-[10px] font-bold text-slate-500 text-center h-4">{message}</p>

      <div className="flex-1 flex items-center justify-center gap-1.5 w-full overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 ${
              highlight === i ? 'bg-green-500/30 text-green-400 scale-110 shadow-[0_0_20px_rgba(34,197,94,0.4)] border-2 border-green-500'
              : comparing === i ? 'bg-yellow-500/20 text-yellow-400 scale-105 border-2 border-yellow-500/50'
              : 'bg-white/10 text-slate-300 border border-white/5'
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
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">
          <option value="bubble">Bubble Sort</option>
          <option value="selection">Selection Sort</option>
        </select>
        <button onClick={startSort} disabled={sorting} className="px-3 py-2 bg-accent-indigo/20 text-accent-indigo text-[10px] font-black uppercase rounded-lg hover:bg-accent-indigo/30 transition-all disabled:opacity-30 flex items-center gap-1">
          <Play size={12} /> Play
        </button>
        <button onClick={reset} className="px-3 py-2 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-lg hover:bg-white/10 transition-all flex items-center gap-1">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <p className="text-[10px] font-bold text-slate-500 text-center h-4">{message}</p>

      <div className="flex-1 flex items-end justify-center gap-[3px] w-full px-4">
        {items.map((val, i) => (
          <div key={i} className={`flex-1 max-w-4 rounded-t-md transition-all duration-100 ${
            sorted.includes(i) ? 'bg-green-500/60'
            : comparing.includes(i) ? 'bg-accent-indigo shadow-[0_0_8px_rgba(99,102,241,0.5)]'
            : 'bg-white/15'
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
    <div className="flex flex-col h-full bg-dark-bg text-slate-200 animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-green-400" />
          <h2 className="text-sm font-black uppercase tracking-widest">Visualizer</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
          <X size={16} />
        </button>
      </div>

      {/* DS Selector Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-white/5">
        {visualizers.map(v => (
          <button key={v.id} onClick={() => setActiveViz(v.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeViz === v.id ? 'bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]' : 'bg-white/5 text-slate-500 hover:text-white'
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
