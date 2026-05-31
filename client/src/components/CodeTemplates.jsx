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
    <div className="flex flex-col h-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] animate-spring-in font-sans">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-[var(--color-accent-primary)]" />
          <h2 className="text-[var(--text-sm)] font-black uppercase tracking-widest text-[var(--color-text-primary)]">Templates</h2>
          <span className="text-[9px] bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] px-2 py-0.5 rounded-full font-bold">{codeTemplates.length}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-[var(--color-bg-elevated)] rounded-xl px-3 py-2 border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-primary)] transition-all">
          <Search size={14} className="text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="bg-transparent border-none outline-none text-[var(--text-xs)] font-semibold text-[var(--color-text-primary)] w-full placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === 'All' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 [&::-webkit-scrollbar]:hidden">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">
            <Code2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-[var(--text-xs)] font-bold">No templates found</p>
          </div>
        )}

        {filtered.map(template => (
          <div key={template.id} className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] overflow-hidden transition-all">
            {/* Template Header (clickable) */}
            <button
              onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-bg-elevated)] transition-all"
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-accent-primary)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded">{template.category}</span>
                  <span className="text-[var(--text-xs)] font-bold text-[var(--color-text-primary)]">{template.title}</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">{template.description}</p>
              </div>
              <ChevronRight size={14} className={`text-[var(--color-text-secondary)] transition-transform ${expandedId === template.id ? 'rotate-90' : ''}`} />
            </button>

            {/* Expanded Code Preview */}
            {expandedId === template.id && (
              <div className="border-t border-[var(--color-border-subtle)] bg-[#1e1e2e]">
                <div className="max-h-64 overflow-y-auto text-xs [&::-webkit-scrollbar]:hidden">
                  <SyntaxHighlighter
                    language={template.language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '12px 16px', background: 'transparent', fontSize: '11px' }}
                  >
                    {template.code}
                  </SyntaxHighlighter>
                </div>
                <div className="flex flex-wrap gap-2 p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
                  <button
                    onClick={() => handleCopy(template.code, template.id)}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-surface)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
                  >
                    <Copy size={12} />
                    {copiedId === template.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => onOpenInEditor && onOpenInEditor(template.code)}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[rgba(232,108,108,0.1)] hover:bg-[rgba(232,108,108,0.2)] text-[10px] font-black uppercase tracking-widest text-[var(--color-functional-danger)] transition-all"
                  >
                    <Code2 size={12} />
                    Open in Editor
                  </button>
                  <button
                    onClick={() => handleInsert(template.code)}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-accent-soft)] hover:opacity-80 text-[10px] font-black uppercase tracking-widest text-[var(--color-accent-primary)] transition-all"
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
