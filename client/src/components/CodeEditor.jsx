import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Trash2, X, Terminal, Copy, Code2 } from 'lucide-react';

const defaultCode = `// 🚀 Chatify Code Runner — Write & Execute JavaScript
// console.log() output appears in the terminal below.

function greet(name) {
  return \`Hello, \${name}! Welcome to Chatify Ultra.\`;
}

console.log(greet("Developer"));

// Try some DSA:
const nums = [5, 3, 8, 1, 9, 2];
console.log("Original:", nums);
console.log("Sorted:", [...nums].sort((a, b) => a - b));
`;

const CodeEditor = ({ onClose, onSendToChat, initialCode }) => {
  const [code, setCode] = useState(initialCode || defaultCode);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);
    setError(null);

    const timers = {};

    const addLog = (log) => {
      setOutput(prev => [...prev, log]);
    };

    const mockConsole = {
      log: (...args) => addLog({ type: 'log', text: args.map(a => formatArg(a)).join(' ') }),
      warn: (...args) => addLog({ type: 'warn', text: args.map(a => formatArg(a)).join(' ') }),
      error: (...args) => addLog({ type: 'error', text: args.map(a => formatArg(a)).join(' ') }),
      info: (...args) => addLog({ type: 'info', text: args.map(a => formatArg(a)).join(' ') }),
      table: (data) => addLog({ type: 'log', text: JSON.stringify(data, null, 2) }),
      time: (label = 'default') => { timers[label] = performance.now(); },
      timeEnd: (label = 'default') => {
        if (timers[label]) {
          const elapsed = (performance.now() - timers[label]).toFixed(2);
          addLog({ type: 'log', text: `${label}: ${elapsed}ms` });
          delete timers[label];
        }
      },
      clear: () => setOutput([]),
    };

    try {
      const fn = new Function('console', code);
      const startTime = performance.now();
      
      if (!code.includes('console.log') && !code.includes('console.warn') && !code.includes('console.error')) {
        addLog({ type: 'info', text: '💡 Hint: Your code does not contain any console.log() statements. Add one to see the output!' });
      }

      fn(mockConsole);
      const duration = (performance.now() - startTime).toFixed(2);

      addLog({ type: 'info', text: `✓ Executed in ${duration}ms` });
    } catch (err) {
      setError(err.message);
    }

    setIsRunning(false);
  };

  const formatArg = (arg) => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') {
      try { return JSON.stringify(arg, null, 2); } 
      catch { return String(arg); }
    }
    return String(arg);
  };

  const clearOutput = () => { setOutput([]); setError(null); };

  const copyOutput = () => {
    const text = output.map(o => o.text).join('\n');
    navigator.clipboard.writeText(text);
  };

  const sendCodeToChat = () => {
    if (onSendToChat) {
      const formatted = '```javascript\n' + code + '\n```';
      onSendToChat(formatted);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg text-slate-200 animate-slide-up">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-emerald-400" />
          <h2 className="text-xs font-black uppercase tracking-widest">Code Runner</h2>
          <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">JS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={sendCodeToChat} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all" title="Send code to chat">
            <Code2 size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Run Bar */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5 shrink-0">
        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
        >
          <Play size={12} fill="currentColor" /> Run
        </button>
        <button
          onClick={clearOutput}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Trash2 size={12} /> Clear
        </button>
        {output.length > 0 && (
          <button onClick={copyOutput} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white transition-all ml-auto" title="Copy output">
            <Copy size={12} />
          </button>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(val) => setCode(val || '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            renderLineHighlight: 'gutter',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Output Terminal */}
      <div className="shrink-0 border-t border-white/5 max-h-[35%] overflow-y-auto bg-[#0a0c10]">
        <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-2 sticky top-0 bg-[#0a0c10] z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Output</span>
        </div>
        <div className="p-3 space-y-1 font-mono text-xs">
          {output.length === 0 && !error && (
            <span className="text-slate-700 text-[11px]">Click "Run" to execute your code...</span>
          )}
          {output.map((log, i) => (
            <div key={i} className={`whitespace-pre-wrap leading-relaxed ${
              log.type === 'error' ? 'text-red-400' 
              : log.type === 'warn' ? 'text-yellow-400'
              : log.type === 'info' ? 'text-emerald-400/70'
              : 'text-slate-300'
            }`}>
              {log.text}
            </div>
          ))}
          {error && (
            <div className="text-red-400 whitespace-pre-wrap">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
