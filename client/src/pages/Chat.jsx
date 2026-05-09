import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Menu, Send, Globe, ChevronUp, Ghost } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:9000';
const socket = io(SOCKET_URL, { autoConnect: false });

// Helper component for individual messages to handle Phantom logic
const MessageBubble = ({ m, user, socket }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
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

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const isMyMessage = m.senderName === user;
  const isPhantomHidden = m.isPhantom && !isMyMessage && !isRevealed;

  return (
    <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} animate-slide-up mb-6 w-full`}>
      <div 
        onClick={handleReveal}
        className={`
          max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-4xl text-sm font-semibold leading-relaxed shadow-neo-out relative
          ${isMyMessage 
            ? 'bg-accent-red text-white rounded-tr-none shadow-red-glow' 
            : 'bg-bubble-received text-slate-300 rounded-tl-none border border-white/5'}
          ${m.isPhantom ? 'border-2 border-dashed border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer' : ''}
          ${isPhantomHidden ? 'blur-md hover:blur-sm transition-all' : ''}
        `}
      >
        {/* Phantom Timer UI */}
        {m.isPhantom && isRevealed && !isMyMessage && (
           <div className="absolute -top-4 -right-2 bg-accent-indigo text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse">
             {timeLeft}
           </div>
        )}
        {m.isPhantom && isMyMessage && (
           <div className="absolute -top-4 -left-2 text-accent-indigo">
             <Ghost size={16} />
           </div>
        )}

        <div className="markdown-body overflow-x-auto">
          <ReactMarkdown
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-xl my-2 text-xs"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-black/30 px-1.5 py-0.5 rounded text-accent-indigo" {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {isPhantomHidden ? "👻 Phantom Message (Click to reveal)" : m.text}
          </ReactMarkdown>
        </div>

        <span className={`block text-[9px] mt-2 opacity-60 ${isMyMessage ? 'text-right' : 'text-left'}`}>
          {m.time}
        </span>
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
  
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join-chat', user);
    api.get('/chat/users').then(res => setAllUsers(res.data));

    socket.on('message-received', (msg) => {
      const isGlobalMsg = msg.recipientName === null && selectedChat === null;
      const isPrivateMsg = (msg.senderName === selectedChat || msg.recipientName === selectedChat);
      if (isGlobalMsg || isPrivateMsg) {
        setMessages(prev => [...prev, msg]);
      } else {
        const sender = msg.recipientName === null ? 'global' : msg.senderName;
        setUnreadCounts(prev => ({ ...prev, [sender]: (prev[sender] || 0) + 1 }));
        toast(`New message from ${msg.senderName}`, { icon: msg.isPhantom ? '👻' : '💬' });
      }
    });

    socket.on('load-messages', (data) => {
      if (skip === 0) setMessages(data.messages);
      else setMessages(prev => [...data.messages, ...prev]);
      setHasMore(data.isMore);
    });

    socket.on('user-typing', (data) => {
      if (data.isTyping) setTypingUser(data.username);
      else setTypingUser(null);
    });

    socket.on('online-users-list', (list) => setOnlineList(list));
    socket.on('user-status-change', (data) => {
      if (data.username !== user) {
        toast(`${data.username} is ${data.status}`, { icon: data.status === 'online' ? '🟢' : '⚫' });
      }
    });

    // ID Update mapping for Phantom Messages
    socket.on('message-id-update', ({ tempId, realId }) => {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, _id: realId } : m));
    });

    socket.on('message-deleted', (deletedId) => {
      setMessages(prev => prev.filter(m => m._id !== deletedId));
    });

    return () => { socket.disconnect(); socket.off(); };
  }, [user, selectedChat, skip]);

  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    socket.emit('fetch-history', { sender: user, recipient: selectedChat, skip: 0 });
    const chatKey = selectedChat === null ? 'global' : selectedChat;
    setUnreadCounts(prev => ({ ...prev, [chatKey]: 0 }));
  }, [selectedChat, user]);

  useEffect(() => { 
    if (skip === 0) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, skip]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing-start', { sender: user, recipient: selectedChat });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing-stop', { recipient: selectedChat });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing-stop', { recipient: selectedChat });
    
    socket.emit('send-message', { 
      senderName: user, 
      recipientName: selectedChat, 
      text: inputText,
      isPhantom: isPhantomMode 
    });
    setInputText('');
  };

  const loadMoreMessages = () => {
    const newSkip = skip + 20;
    setSkip(newSkip);
    socket.emit('fetch-history', { sender: user, recipient: selectedChat, skip: newSkip });
  };

  const handleLogout = () => { localStorage.clear(); setAuth(null); navigate('/login'); };

  return (
    <div className="h-screen flex bg-dark-bg overflow-hidden text-slate-200 font-sans">
      <Sidebar 
        user={user} 
        allUsers={allUsers} 
        onlineList={onlineList} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onLogout={handleLogout}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        unreadCounts={unreadCounts}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-dark-bg">
        {/* Header */}
        <header className="h-24 px-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-full shadow-neo-out flex items-center justify-center mr-2">
              <Menu size={20} />
            </button>
            <div className="w-12 h-12 rounded-full shadow-neo-out p-0.5 relative">
              {selectedChat ? (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat}`} className="rounded-full" alt="avatar" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-accent-red">
                  <Globe size={24} />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{selectedChat ? selectedChat : 'Global Chat'}</h2>
              <p className="text-[10px] font-bold text-accent-red uppercase tracking-widest flex items-center gap-1.5 h-4">
                {typingUser ? (
                  <span className="animate-pulse">{typingUser} is typing...</span>
                ) : (
                  <span className="text-slate-500">
                    {selectedChat ? (onlineList.includes(selectedChat) ? 'Active Now' : 'Offline') : `${onlineList.length} Active`}
                  </span>
                )}
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedChat && messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale">
                <Globe size={64} className="mb-4" />
                <p className="font-black uppercase tracking-[0.3em] text-xs">No public chatter yet...</p>
             </div>
          )}

          {selectedChat === 'placeholder' ? (
             <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-4xl shadow-neo-out flex items-center justify-center text-accent-red mb-6 animate-bounce">
                  <Ghost size={48} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Private Mode Active</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest px-12">Select a user from the sidebar to start a secure conversation.</p>
             </div>
          ) : (
            <>
              {hasMore && (
                <div className="flex justify-center mb-8">
                  <button 
                    onClick={loadMoreMessages}
                    className="flex items-center gap-2 px-6 py-2 rounded-full shadow-neo-out text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                  >
                    <ChevronUp size={14} />
                    Load Older Messages
                  </button>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                {messages.map((m, i) => (
                  <MessageBubble key={m._id || i} m={m} user={user} socket={socket} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </main>

        {/* Input */}
        <footer className="p-6 pt-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-4">
            
            {/* Phantom Toggle Button */}
            <button 
              type="button"
              onClick={() => setIsPhantomMode(!isPhantomMode)}
              title="Toggle Phantom Mode"
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isPhantomMode ? 'bg-accent-indigo text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'shadow-neo-out text-slate-500 hover:text-white'}`}
            >
              <Ghost size={22} />
            </button>

            <div className={`flex-1 shadow-neo-in rounded-4xl px-6 py-4 flex items-center gap-4 bg-dark-bg/50 transition-all ${isPhantomMode ? 'ring-2 ring-accent-indigo/50' : ''}`}>
              <input 
                value={inputText}
                onChange={handleInputChange}
                disabled={selectedChat === 'placeholder'}
                placeholder={isPhantomMode ? "Type a disappearing message..." : (selectedChat === 'placeholder' ? "Select a contact first..." : "Message...")}
                className={`bg-transparent border-none outline-none text-sm font-semibold text-white w-full placeholder:text-slate-700 disabled:opacity-30 ${isPhantomMode ? 'italic text-accent-indigo' : ''}`}
              />
            </div>

            <button 
              type="submit" 
              disabled={selectedChat === 'placeholder'}
              className={`w-14 h-14 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-20 ${isPhantomMode ? 'bg-accent-indigo shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-accent-red shadow-red-glow hover:scale-105 active:shadow-neo-in'}`}
            >
              <Send size={22} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default Chat;
