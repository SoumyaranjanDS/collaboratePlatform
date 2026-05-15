import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../socket';
import { playSendSound } from '../data/sounds';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Menu, Send, Globe, ChevronUp, Ghost, PenTool, MessageSquare, Code2, Layers, Terminal, Paperclip, X, FileText, Download, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Whiteboard from '../components/Whiteboard';
import CodeTemplates from '../components/CodeTemplates';
import DSAVisualizer from '../components/DSAVisualizer';
import CodeEditor from '../components/CodeEditor';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:9000';
// socket imported from ../socket

const CLOUD_NAME = 'dvdd218yw';
const UPLOAD_PRESET = 'o3ywg1ms';

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  let resourceType = 'auto';
  if (file.type.startsWith('video/')) resourceType = 'video';
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
};

const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'file';
};

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '👀', '🎉'];

const MessageBubble = ({ m, user, socket, onReply }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const timerRef = useRef(null);

  const handleReveal = () => {
    if (!m.isPhantom || m.senderName === user || isRevealed) return;
    setIsRevealed(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (m._id && !m._id.toString().includes(Date.now().toString().slice(0, 5))) {
            socket.emit('delete-message', m._id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleReact = (emoji) => {
    socket.emit('react-to-message', { messageId: m._id, emoji, username: user });
    setShowEmojiPicker(false);
  };

  const isMyMessage = m.senderName === user;
  const isPhantomHidden = m.isPhantom && !isMyMessage && !isRevealed;
  const hasFile = !!m.fileUrl;

  return (
    <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} animate-slide-up mb-2 w-full group`}>
      {m.replyTo && m.replyTo.senderName && (
        <div className={`max-w-[70%] mb-1 px-3 py-1.5 rounded-xl bg-white/5 border-l-2 border-accent-indigo/50 ${isMyMessage ? 'mr-2' : 'ml-2'}`}>
          <span className="text-[9px] font-black text-accent-indigo uppercase tracking-widest">{m.replyTo.senderName}</span>
          <p className="text-[10px] text-slate-500 truncate">{m.replyTo.text || '📎 Attachment'}</p>
        </div>
      )}

      <div className="relative">
        <div className={`absolute top-0 ${isMyMessage ? '-left-16' : '-right-16'} hidden group-hover:flex items-center gap-1 z-10`}>
          <button onClick={() => onReply && onReply(m)} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all text-[10px]" title="Reply">↩</button>
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all text-[10px]" title="React">😀</button>
        </div>

        {showEmojiPicker && (
          <div className={`absolute -top-10 ${isMyMessage ? 'right-0' : 'left-0'} flex gap-1 bg-[#0a0c10] border border-white/10 rounded-2xl px-2 py-1.5 shadow-lg z-20`}>
            {QUICK_EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => handleReact(emoji)} className="text-sm hover:scale-125 transition-transform px-0.5">{emoji}</button>
            ))}
          </div>
        )}

        <div 
          onClick={handleReveal}
          onDoubleClick={() => !m.isPhantom && setShowEmojiPicker(!showEmojiPicker)}
          className={`
            w-fit max-w-[85%] md:max-w-[75%] rounded-3xl text-[15px] font-medium leading-relaxed relative
            ${hasFile ? 'p-1.5 pb-1' : 'px-4 py-2.5'}
            ${isMyMessage 
              ? (hasFile ? 'bg-white/5 border border-white/10 rounded-tr-sm' : 'bg-accent-indigo text-white rounded-tr-sm shadow-md')
              : (hasFile ? 'bg-white/5 border border-white/10 rounded-tl-sm' : 'bg-[#20232b] text-slate-200 rounded-tl-sm border border-white/5 shadow-md')}
            ${m.isPhantom ? 'border-2 border-dashed border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer' : ''}
            ${isPhantomHidden ? 'blur-md hover:blur-sm transition-all' : ''}
          `}
        >
          {m.isPhantom && isRevealed && !isMyMessage && (
            <div className="absolute -top-4 -right-2 bg-accent-indigo text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse">{timeLeft}</div>
          )}
          {m.isPhantom && isMyMessage && (
            <div className="absolute -top-4 -left-2 text-accent-indigo"><Ghost size={16} /></div>
          )}

          {m.fileUrl && m.fileType === 'image' && (
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="block mb-2 rounded-xl overflow-hidden">
              <img src={m.fileUrl} alt={m.fileName || 'Image'} className="max-w-full max-h-64 rounded-xl object-cover" loading="lazy" />
            </a>
          )}
          {m.fileUrl && m.fileType === 'video' && (
            <video src={m.fileUrl} controls className="max-w-full max-h-64 rounded-xl mb-2" />
          )}
          {m.fileUrl && (m.fileType === 'pdf' || m.fileType === 'file') && (
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-3 mb-2 hover:bg-black/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-accent-indigo/20 flex items-center justify-center shrink-0"><FileText size={18} className="text-accent-indigo" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{m.fileName || 'File'}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">{m.fileType === 'pdf' ? 'PDF Document' : 'File'}</p>
              </div>
              <Download size={14} className="text-slate-500 shrink-0" />
            </a>
          )}

          {m.text && (
          <div className={`break-words whitespace-pre-wrap overflow-hidden ${hasFile ? 'px-2 pt-1' : ''}`}>
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-xl my-2 text-xs" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-black/30 px-1.5 py-0.5 rounded text-accent-indigo" {...props}>{children}</code>
                  )
                }
              }}
            >
              {isPhantomHidden ? "👻 Phantom Message (Click to reveal)" : m.text}
            </ReactMarkdown>
          </div>
          )}

          <div className={`flex items-center gap-1.5 mt-1 ${hasFile ? 'px-3 pb-1.5' : ''} ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[9px] opacity-60">{m.time}</span>
            {isMyMessage && m.recipientName && (
              <span className={`text-[9px] font-bold ${m.isRead ? 'text-blue-400' : 'text-slate-600'}`}>
                {m.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>

        {m.reactions && m.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            {m.reactions.map((r, i) => (
              <button key={i} onClick={() => handleReact(r.emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-all ${
                  r.users.includes(user) ? 'bg-accent-indigo/20 border-accent-indigo/40 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}>
                <span>{r.emoji}</span>
                <span className="font-bold">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!isMyMessage && (
        <span className="text-[9px] font-black text-slate-600 mt-2 ml-2 uppercase tracking-widest">{m.senderName}</span>
      )}
    </div>
  );
};

const Chat = ({ user, setAuth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isPhantomMode, setIsPhantomMode] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineList, setOnlineList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(location.state?.initialMode === 'personal');
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const [activePanel, setActivePanel] = useState(location.state?.initialPanel || null);
  const [canvasStates, setCanvasStates] = useState({});
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [editorInitialCode, setEditorInitialCode] = useState('');
  
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [pendingFile, setPendingFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Ask for notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    socket.connect();
    socket.emit('join-chat', user);
    api.get('/chat/users').then(res => setAllUsers(res.data));

    socket.on('online-users', (users) => setOnlineList(users));

    socket.on('message-received', (msg) => {
      setMessages(prev => [...prev, msg]);
      
      // If message is for me, and I have this chat open, mark it as read immediately
      if (msg.recipientName === user && msg.senderName === selectedChat) {
        socket.emit('mark-read', { reader: user, sender: msg.senderName });
      }

      // Browser Notification
      if (document.hidden && msg.senderName !== user) {
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${msg.senderName}`, {
            body: msg.text || '📎 Attachment',
            icon: '/vite.svg'
          });
        }
      }

      // Read unread messages logic
      if (msg.senderName !== user && selectedChat !== msg.senderName && msg.recipientName === user) {
        setUnreadCounts(prev => ({ ...prev, [msg.senderName]: (prev[msg.senderName] || 0) + 1 }));
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    socket.on('message-id-update', ({ tempId, realId }) => {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, _id: realId } : m));
    });

    socket.on('message-deleted', (messageId) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });

    socket.on('load-messages', ({ messages: history, isMore }) => {
      setMessages(prev => {
        // Prevent duplicate appending on initial load
        if (prev.length === 0) return history;
        
        // Ensure no duplicates by ID
        const existingIds = new Set(prev.map(m => m._id));
        const newHistory = history.filter(m => !existingIds.has(m._id));
        
        return [...newHistory, ...prev];
      });
      setHasMore(isMore);
    });

    socket.on('typing', ({ sender }) => { setTypingUser(sender); setIsTyping(true); });
    socket.on('typing-stop', () => { setIsTyping(false); setTypingUser(null); });

    socket.on('message-reaction-update', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    });

    socket.on('messages-read', ({ reader, sender }) => {
      if (user === sender) {
        setMessages(prev => prev.map(m => (m.recipientName === reader && !m.isRead) ? { ...m, isRead: true } : m));
      }
    });

    return () => {
      socket.off('online-users');
      socket.off('message-received');
      socket.off('load-messages');
      socket.off('typing');
      socket.off('typing-stop');
      socket.off('message-id-update');
      socket.off('message-deleted');
      socket.off('message-reaction-update');
      socket.off('messages-read');
    };
  }, [selectedChat, user]);

  useEffect(() => {
    setMessages([]);
    setSkip(0);
    setHasMore(true);
    setReplyToMsg(null);
    if (selectedChat !== 'placeholder') {
      socket.emit('fetch-history', { sender: user, recipient: selectedChat, skip: 0 });
      // Mark read when entering chat
      if (selectedChat) {
        socket.emit('mark-read', { reader: user, sender: selectedChat });
        setUnreadCounts(prev => ({ ...prev, [selectedChat]: 0 }));
      }
    }
  }, [selectedChat, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    socket.emit('typing', { sender: user, recipient: selectedChat });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { recipient: selectedChat });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !pendingFile) return;
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing-stop', { recipient: selectedChat });

    let fileUrl = null, fileType = null, fileName = null;

    if (pendingFile) {
      setIsUploading(true);
      try {
        const result = await uploadToCloudinary(pendingFile.file);
        fileUrl = result.secure_url;
        fileType = pendingFile.type;
        fileName = pendingFile.file.name;
      } catch (err) {
        toast.error('File upload failed. Try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
      setPendingFile(null);
    }
    
    socket.emit('send-message', { 
      senderName: user, 
      recipientName: selectedChat, 
      text: inputText,
      isPhantom: isPhantomMode,
      fileUrl,
      fileType,
      fileName,
      replyTo: replyToMsg ? { _id: replyToMsg._id, senderName: replyToMsg.senderName, text: replyToMsg.text } : null
    });
    
    playSendSound();
    setInputText('');
    setReplyToMsg(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Max file size is 10MB'); return; }
    const type = getFileType(file.type);
    const preview = type === 'image' ? URL.createObjectURL(file) : null;
    setPendingFile({ file, preview, type });
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Max file size is 10MB'); return; }
    const type = getFileType(file.type);
    const preview = type === 'image' ? URL.createObjectURL(file) : null;
    setPendingFile({ file, preview, type });
  };

  const loadMoreMessages = () => {
    const newSkip = skip + 20;
    setSkip(newSkip);
    socket.emit('fetch-history', { sender: user, recipient: selectedChat, skip: newSkip });
  };

  const handleLogout = () => { localStorage.clear(); setAuth(null); navigate('/login'); };

  return (
    <div className="h-[100dvh] flex bg-dark-bg overflow-hidden text-slate-200 font-sans">
      <div className={`${isSidebarOpen ? 'w-full' : 'w-0'} md:w-80 overflow-hidden flex flex-col transition-all duration-300 ease-in-out shrink-0 border-r border-white/5 bg-[#0a0c10]`}>
        <Sidebar 
          allUsers={allUsers} onlineList={onlineList}
          selectedChat={selectedChat} setSelectedChat={(c) => { setSelectedChat(c); setIsSidebarOpen(false); }}
          currentUser={user} onLogout={handleLogout} unreadCounts={unreadCounts}
        />
      </div>

      <div className={`flex-1 flex flex-col min-w-0 transition-all ${isSidebarOpen ? 'hidden md:flex' : 'flex'}`}>
        <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0a0c10]/80 backdrop-blur-xl z-10 relative">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-slate-400 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base truncate tracking-wide text-white">
                  {selectedChat ? `@${selectedChat}` : 'Global Lobby'}
                </span>
                {selectedChat && onlineList.includes(selectedChat) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0 animate-pulse"></span>
                )}
              </div>
              {selectedChat && <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{onlineList.includes(selectedChat) ? 'Online' : 'Offline'}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button onClick={() => { setActivePanel(activePanel === 'templates' ? null : 'templates'); setIsWhiteboardActive(false); }} title="Code Templates"
              className={`p-2.5 md:p-2 rounded-xl transition-all ${activePanel === 'templates' ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              <Code2 size={18} />
            </button>
            <button onClick={() => { setActivePanel(activePanel === 'visualizer' ? null : 'visualizer'); setIsWhiteboardActive(false); }} title="DSA Visualizer"
              className={`p-2.5 md:p-2 rounded-xl transition-all ${activePanel === 'visualizer' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              <Layers size={18} />
            </button>
            <button onClick={() => { setActivePanel(activePanel === 'editor' ? null : 'editor'); setIsWhiteboardActive(false); }} title="JS Editor"
              className={`p-2.5 md:p-2 rounded-xl transition-all ${activePanel === 'editor' ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              <Terminal size={18} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <button onClick={() => { setIsWhiteboardActive(!isWhiteboardActive); setActivePanel(null); }} title="Whiteboard"
              className={`p-2.5 md:p-2 rounded-xl transition-all ${isWhiteboardActive ? 'bg-accent-red text-white shadow-red-glow' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              {isWhiteboardActive ? <MessageSquare size={18} /> : <PenTool size={18} />}
            </button>
          </div>
        </header>

        {isWhiteboardActive ? (
          <div className="flex-1 overflow-hidden relative">
            <Whiteboard 
              socket={socket} 
              room={selectedChat || 'global'} 
              initialData={canvasStates[selectedChat || 'global']}
              onSave={(dataUrl) => setCanvasStates(prev => ({ ...prev, [selectedChat || 'global']: dataUrl }))}
            />
          </div>
        ) : activePanel ? (
          <div className="flex-1 overflow-hidden">
            {activePanel === 'templates' && <CodeTemplates 
              onInsert={(code) => { setInputText(code); setActivePanel(null); }} 
              onOpenInEditor={(code) => { setEditorInitialCode(code); setActivePanel('editor'); }}
              onClose={() => setActivePanel(null)} 
            />}
            {activePanel === 'visualizer' && <DSAVisualizer onClose={() => setActivePanel(null)} />}
            {activePanel === 'editor' && <CodeEditor initialCode={editorInitialCode} onClose={() => setActivePanel(null)} onSendToChat={(code) => { setInputText(code); setActivePanel(null); }} />}
          </div>
        ) : (
          <>
            <main className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden p-6" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
              {!selectedChat && messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale">
                  <Globe size={64} className="mb-4" />
                  <p className="font-black uppercase tracking-[0.3em] text-xs">No public chatter yet...</p>
                </div>
              )}

              {messages.length > 0 && (
                <div className="flex flex-col min-h-full">
                  <div className="flex-1" />
                  {hasMore && (
                    <button onClick={loadMoreMessages} className="mx-auto mb-8 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">
                      <ChevronUp size={14} /> Load earlier
                    </button>
                  )}
                  {messages.map((m, i) => (
                    <MessageBubble key={m._id || i} m={m} user={user} socket={socket} onReply={setReplyToMsg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </main>

            <footer className="p-6 pt-0">
              {replyToMsg && (
                <div className="mb-3 flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/10 border-l-2 border-l-accent-indigo">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-accent-indigo uppercase tracking-widest">Replying to {replyToMsg.senderName}</p>
                    <p className="text-xs text-slate-300 truncate">{replyToMsg.text || '📎 Attachment'}</p>
                  </div>
                  <button type="button" onClick={() => setReplyToMsg(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"><X size={14} /></button>
                </div>
              )}

              {pendingFile && (
                <div className="mb-3 flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                  {pendingFile.preview ? (
                    <img src={pendingFile.preview} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-accent-indigo/20 flex items-center justify-center">
                      <FileText size={20} className="text-accent-indigo" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{pendingFile.file.name}</p>
                    <p className="text-[9px] text-slate-500">{(pendingFile.file.size / 1024).toFixed(1)} KB · {pendingFile.type.toUpperCase()}</p>
                  </div>
                  <button type="button" onClick={() => setPendingFile(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"><X size={14} /></button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-3 md:gap-4">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip" />
                
                <button type="button" onClick={() => setIsPhantomMode(!isPhantomMode)} title="Toggle Phantom Mode"
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shrink-0 ${isPhantomMode ? 'bg-accent-indigo text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'shadow-neo-out text-slate-500 hover:text-white'}`}>
                  <Ghost size={20} />
                </button>

                <div className={`flex-1 shadow-neo-in rounded-4xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 bg-dark-bg/50 transition-all ${isPhantomMode ? 'ring-2 ring-accent-indigo/50' : ''}`}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={selectedChat === 'placeholder'}
                    className="text-slate-600 hover:text-accent-indigo transition-all disabled:opacity-20 shrink-0" title="Attach file">
                    <Paperclip size={18} />
                  </button>
                  <input 
                    value={inputText} onChange={handleInputChange} disabled={selectedChat === 'placeholder'}
                    placeholder={isPhantomMode ? "Type a disappearing message..." : (selectedChat === 'placeholder' ? "Select a contact first..." : "Message...")}
                    className={`bg-transparent border-none outline-none text-sm font-semibold text-white w-full placeholder:text-slate-700 disabled:opacity-30 ${isPhantomMode ? 'italic text-accent-indigo' : ''}`}
                  />
                </div>

                <button type="submit" disabled={(selectedChat === 'placeholder') || isUploading}
                  className={`w-12 h-12 md:w-14 md:h-14 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-20 shrink-0 ${isPhantomMode ? 'bg-accent-indigo shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-accent-red shadow-red-glow hover:scale-105 active:shadow-neo-in'}`}>
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
