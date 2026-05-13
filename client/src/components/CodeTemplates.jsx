import React, { useState } from 'react';
import { Search, Copy, Send, X, Code2, ChevronRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import codeTemplates, { categories } from '../data/codeTemplates';

const CodeTemplates = ({ onInsert, onOpenInEditor, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filtered = codeTemplates.filter(t => {
    const matchesSearch = !search || 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleInsert = (code) => {
    const formatted = '```javascript\n' + code + '\n```';
    onInsert(formatted);
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg text-slate-200 animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-accent-indigo" />
          <h2 className="text-sm font-black uppercase tracking-widest">Templates</h2>
          <span className="text-[9px] bg-accent-indigo/20 text-accent-indigo px-2 py-0.5 rounded-full font-bold">{codeTemplates.length}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="bg-transparent border-none outline-none text-xs font-semibold text-white w-full placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === 'All' ? 'bg-accent-indigo text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-accent-indigo text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 [&::-webkit-scrollbar]:hidden">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <Code2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-xs font-bold">No templates found</p>
          </div>
        )}

        {filtered.map(template => (
          <div key={template.id} className="rounded-xl border border-white/5 overflow-hidden transition-all">
            {/* Template Header (clickable) */}
            <button
              onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/3 transition-all"
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent-indigo bg-accent-indigo/10 px-2 py-0.5 rounded">{template.category}</span>
                  <span className="text-xs font-bold text-white">{template.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{template.description}</p>
              </div>
              <ChevronRight size={14} className={`text-slate-600 transition-transform ${expandedId === template.id ? 'rotate-90' : ''}`} />
            </button>

            {/* Expanded Code Preview */}
            {expandedId === template.id && (
              <div className="border-t border-white/5">
                <div className="max-h-64 overflow-y-auto text-xs [&::-webkit-scrollbar]:hidden">
                  <SyntaxHighlighter
                    language={template.language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '12px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px' }}
                  >
                    {template.code}
                  </SyntaxHighlighter>
                </div>
                <div className="flex gap-2 p-3 border-t border-white/5">
                  <button
                    onClick={() => handleCopy(template.code, template.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                  >
                    <Copy size={12} />
                    {copiedId === template.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => onOpenInEditor && onOpenInEditor(template.code)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-black uppercase tracking-widest text-amber-500 transition-all"
                  >
                    <Code2 size={12} />
                    Open in Editor
                  </button>
                  <button
                    onClick={() => handleInsert(template.code)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent-indigo/20 hover:bg-accent-indigo/30 text-[10px] font-black uppercase tracking-widest text-accent-indigo transition-all"
                  >
                    <Send size={12} />
                    Send to Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeTemplates;
