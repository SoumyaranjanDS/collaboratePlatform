import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../socket';
import { playSendSound, playReceiveSound, playCallIncomingSound, playHangupSound, unlockAudio } from '../data/sounds';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Menu, Send, Globe, ChevronUp, Ghost, PenTool, MessageSquare, Code2, Layers, Terminal, Paperclip, X, FileText, Download, Loader2, Phone, AlertOctagon, ShieldAlert, Timer, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Whiteboard from '../components/Whiteboard';
import CodeTemplates from '../components/CodeTemplates';
import DSAVisualizer from '../components/DSAVisualizer';
import CodeEditor from '../components/CodeEditor';
import VideoCall from '../components/VideoCall';
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

const ROAST_MESSAGES = [
  (name) => `Bruh, @${name} took one look at your call and chose their beauty sleep instead. We sent them a mail though — maybe next time, bestie! 😴📬`,
  (name) => `Plot twist: @${name} saw your caller ID and thought it was spam. Bold assumption tbh. We notified them anyway! 🤡📩`,
  (name) => `30 whole seconds of silence. @${name} ghosted your call like it's 2019 Tinder. We sent them a guilt-trip email — you're welcome! 👻💌`,
  (name) => `@${name} was probably busy doing something super important... like watching cat videos. We alerted them via email — stay hopeful king! 🐱📮`,
  (name) => `Oof. @${name} let you ring for 30 seconds and said absolutely nothing. Even the dial tone feels bad for you. We fired off an email though! 💀📧`,
];

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} mb-4 w-full group relative`}
    >
      {m.replyTo && m.replyTo.senderName && (
        <div className={`max-w-[75%] mb-1 px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] border-l-2 border-l-blue-500 ${isMyMessage ? 'mr-2' : 'ml-2'}`}>
          <span className="text-[10px] font-semibold text-blue-600 tracking-wide">{m.replyTo.senderName}</span>
          <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{m.replyTo.text || '📎 Attachment'}</p>
        </div>
      )}

      <div className="relative flex items-center">
        {/* Actions Menu */}
        <div className={`absolute top-1/2 -translate-y-1/2 ${isMyMessage ? '-left-14' : '-right-14'} hidden group-hover:flex items-center gap-1 z-10`}>
          <button onClick={() => onReply && onReply(m)} className="p-1.5 rounded-lg bg-white border border-[var(--color-border-subtle)] hover:bg-gray-50 text-gray-500 transition-colors shadow-sm" title="Reply">↩</button>
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 rounded-lg bg-white border border-[var(--color-border-subtle)] hover:bg-gray-50 text-gray-500 transition-colors shadow-sm" title="React">😀</button>
        </div>

        {showEmojiPicker && (
          <div className={`absolute -top-12 ${isMyMessage ? 'right-0' : 'left-0'} flex gap-1 bg-white border border-[var(--color-border-subtle)] rounded-xl px-2 py-1.5 shadow-lg z-20`}>
            {QUICK_EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => handleReact(emoji)} className="text-sm hover:scale-125 transition-transform px-1">{emoji}</button>
            ))}
          </div>
        )}

        <div 
          onClick={handleReveal}
          onDoubleClick={() => !m.isPhantom && setShowEmojiPicker(!showEmojiPicker)}
          className={`
            w-fit max-w-[95%] md:max-w-[85%] text-[var(--text-base)] leading-relaxed relative transition-all duration-200 shadow-[var(--shadow-md)] animate-spring-in
            ${hasFile ? 'p-2' : 'px-[14px] py-[10px]'}
            ${isMyMessage 
              ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-on-accent)] bubble-sent' 
              : 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] bubble-received'}
            ${m.isPhantom ? 'border-2 border-dashed border-purple-400 cursor-pointer shadow-md' : ''}
            ${isPhantomHidden ? 'frosted-glass text-[var(--color-text-muted)] border-dashed border-[var(--color-border-subtle)]' : ''}
          `}
        >
          {m.isPhantom && isRevealed && !isMyMessage && (
            <div className="absolute -top-2 -right-2 bg-[var(--color-accent-secondary)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">{timeLeft}</div>
          )}
          {m.isPhantom && isMyMessage && (
            <div className="absolute -top-2 -left-2 text-purple-500"><Ghost size={16} /></div>
          )}

          {m.fileUrl && m.fileType === 'image' && (
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="block mb-2 rounded-xl overflow-hidden border border-black/10">
              <img src={m.fileUrl} alt={m.fileName || 'Image'} className="max-w-full max-h-64 rounded-xl object-cover hover:scale-[1.02] transition-transform duration-300" loading="lazy" />
            </a>
          )}
          
          {m.fileUrl && (m.fileType === 'pdf' || m.fileType === 'file') && (
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-2 transition-colors ${isMyMessage ? 'bg-black/10 hover:bg-black/20 text-white' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMyMessage ? 'bg-white/20' : 'bg-white shadow-sm border border-gray-100'}`}><FileText size={18} /></div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold truncate">{m.fileName || 'File'}</p>
                <p className={`text-[10px] ${isMyMessage ? 'text-white/70' : 'text-gray-500'}`}>{m.fileType === 'pdf' ? 'PDF Document' : 'File'}</p>
              </div>
              <Download size={14} className="shrink-0" />
            </a>
          )}

          {m.text && (
            <div className={`break-words whitespace-pre-wrap text-left ${hasFile ? 'px-1 pt-1' : ''}`}>
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter language={match[1]} PreTag="div" className="rounded-lg my-2 text-xs border border-gray-200" {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={`px-1.5 py-0.5 rounded font-mono text-xs ${isMyMessage ? 'bg-black/20' : 'bg-gray-100 text-pink-600'}`} {...props}>{children}</code>
                    )
                  }
                }}
              >
                {isPhantomHidden ? "👻 Phantom Message" : m.text}
              </ReactMarkdown>
            </div>
          )}

          <div className={`flex items-center gap-1.5 mt-1 ${isMyMessage ? 'justify-end text-gray-300' : 'justify-start text-gray-400'}`}>
            <span className="text-[10px]">{m.time}</span>
            {isMyMessage && m.recipientName && (
              <span className={`text-[10px] font-bold ${m.isRead ? (isMyMessage ? 'text-white' : 'text-blue-500') : ''}`}>
                {m.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>

      {m.reactions && m.reactions.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 ${isMyMessage ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
          {m.reactions.map((r, i) => (
            <button key={i} onClick={() => handleReact(r.emoji)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-all shadow-sm ${
                r.users.includes(user) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-[var(--color-border-subtle)] text-gray-500 hover:bg-gray-50'
              }`}>
              <span>{r.emoji}</span>
              <span className="font-semibold">{r.users.length}</span>
            </button>
          ))}
        </div>
      )}

      {!isMyMessage && (
        <span className="text-[10px] font-medium text-gray-400 mt-1 ml-2">{m.senderName}</span>
      )}
    </motion.div>
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
  const [toolMode, setToolMode] = useState('collaborative');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const incomingCallAudioRef = useRef(null);
  const callTimerRef = useRef(null);
  const callCountdownRef = useRef(null);
  
  const [pendingFile, setPendingFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  // Call timer
  const [callCountdown, setCallCountdown] = useState(30);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [callTimedOut, setCallTimedOut] = useState(false);
  const [timedOutCallPeer, setTimedOutCallPeer] = useState('');
  const [roastMessage, setRoastMessage] = useState('');
  // Admin warning
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  const [adminWarningText, setAdminWarningText] = useState('');

  // Buffer early ICE candidates received before VideoCall mounts
  const [bufferedCandidates, setBufferedCandidates] = useState([]);
  // Report user
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportTarget, setReportTarget] = useState('');

  const rightPaneVisible = selectedChat || activePanel || isWhiteboardActive;
  // Ask for notification permission and unlock AudioContext on user interaction
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const handleUnlock = () => {
      unlockAudio();
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
    window.addEventListener('click', handleUnlock);
    window.addEventListener('keydown', handleUnlock);
    return () => {
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, []);

  useEffect(() => {
    socket.connect();
    socket.emit('join-chat', user);
    api.get('/chat/users').then(res => setAllUsers(res.data));

    socket.on('online-users', (users) => setOnlineList(users));

    socket.on('message-received', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (msg.senderName !== user) {
        playReceiveSound();
      }
      
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

    socket.on('incoming-call', ({ from, offer }) => {
      setIncomingCall({ from, offer });
      setBufferedCandidates([]); // Reset buffer for new call
      if (incomingCallAudioRef.current) {
        incomingCallAudioRef.current.pause();
      }
      incomingCallAudioRef.current = playCallIncomingSound();
    });

    socket.on('ice-candidate', ({ candidate }) => {
      // Buffer the candidate if the call hasn't been accepted yet
      setBufferedCandidates(prev => [...prev, candidate]);
    });

    // Clear auto-hangup timer when peer accepts the call
    socket.on('call-accepted', () => {
      clearTimeout(callTimerRef.current);
      clearInterval(callCountdownRef.current);
      setIsCallAccepted(true);
      setCallCountdown(30);
    });

    socket.on('call-rejected', () => {
      clearTimeout(callTimerRef.current);
      clearInterval(callCountdownRef.current);
      setIsCallAccepted(false);
      setCallCountdown(30);
      setIncomingCall(null);
      setActiveVideoCall(null);
      if (incomingCallAudioRef.current) {
        incomingCallAudioRef.current.pause();
        incomingCallAudioRef.current = null;
      }
    });

    socket.on('end-call', () => {
      clearTimeout(callTimerRef.current);
      clearInterval(callCountdownRef.current);
      setIsCallAccepted(false);
      setCallCountdown(30);
      setIncomingCall(null);
      setActiveVideoCall(null);
      if (incomingCallAudioRef.current) {
        incomingCallAudioRef.current.pause();
        incomingCallAudioRef.current = null;
      }
    });

    // Live admin warning push
    socket.on('admin-warning', ({ warningText }) => {
      setAdminWarningText(warningText);
      setShowAdminWarning(true);
    });

    return () => {
      if (incomingCallAudioRef.current) {
        incomingCallAudioRef.current.pause();
      }
      socket.off('online-users');
      socket.off('message-received');
      socket.off('load-messages');
      socket.off('typing');
      socket.off('typing-stop');
      socket.off('message-id-update');
      socket.off('message-deleted');
      socket.off('message-reaction-update');
      socket.off('messages-read');
      socket.off('incoming-call');
      socket.off('ice-candidate');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('end-call');
      socket.off('admin-warning');
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

  useEffect(() => {
    if (incomingCall) {
      const handleUserInteraction = () => {
        unlockAudio();
        if (incomingCall && !incomingCallAudioRef.current) {
          incomingCallAudioRef.current = playCallIncomingSound();
        }
        window.removeEventListener('mousemove', handleUserInteraction);
        window.removeEventListener('click', handleUserInteraction);
      };
      window.addEventListener('mousemove', handleUserInteraction);
      window.addEventListener('click', handleUserInteraction);
      return () => {
        window.removeEventListener('mousemove', handleUserInteraction);
        window.removeEventListener('click', handleUserInteraction);
      };
    }
  }, [incomingCall]);

  // 30-second auto-hangup timer for outgoing calls
  // Clears automatically when isCallAccepted becomes true (peer picks up)
  useEffect(() => {
    if (activeVideoCall && activeVideoCall.isCaller && !isCallAccepted) {
      const peer = activeVideoCall.peer;
      setCallTimedOut(false);

      callCountdownRef.current = setInterval(() => {
        setCallCountdown(prev => {
          if (prev <= 1) {
            clearInterval(callCountdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      callTimerRef.current = setTimeout(() => {
        clearInterval(callCountdownRef.current);
        socket.emit('end-call', { to: peer });
        playHangupSound();
        const msg = ROAST_MESSAGES[Math.floor(Math.random() * ROAST_MESSAGES.length)](peer);
        setRoastMessage(msg);
        setTimedOutCallPeer(peer);
        setActiveVideoCall(null);
        setCallTimedOut(true);
      }, 30000);
    } else {
      // Call was accepted OR no active call — clear all timers
      clearTimeout(callTimerRef.current);
      clearInterval(callCountdownRef.current);
    }
    return () => {
      clearTimeout(callTimerRef.current);
      clearInterval(callCountdownRef.current);
    };
  }, [activeVideoCall?.isCaller, activeVideoCall?.peer, isCallAccepted]);

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

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    if (incomingCallAudioRef.current) {
      incomingCallAudioRef.current.pause();
      incomingCallAudioRef.current = null;
    }
    setActiveVideoCall({ peer: incomingCall.from, isCaller: false, offer: incomingCall.offer });
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    if (!incomingCall) return;
    if (incomingCallAudioRef.current) {
      incomingCallAudioRef.current.pause();
      incomingCallAudioRef.current = null;
    }
    playHangupSound();
    socket.emit('call-rejected', { to: incomingCall.from });
    setIncomingCall(null);
  };

  const handleStartCall = () => {
    if (!selectedChat || selectedChat === 'placeholder') return;
    setActiveVideoCall({ peer: selectedChat, isCaller: true });
  };

  const handleCallEnded = () => {
    const hasReviewed = localStorage.getItem('hasReviewed') === 'true';
    if (hasReviewed) return;

    const currentCalls = parseInt(localStorage.getItem('callCount') || '0') + 1;
    localStorage.setItem('callCount', currentCalls.toString());

    if (currentCalls >= 3) {
      setShowReviewModal(true);
    }
  };

  const submitFeedback = async () => {
    if (userRating === 0) return;
    try {
      await api.post('/chat/feedback', { username: user, rating: userRating, review: userReview });
      toast.success('Thank you for helping us optimize!');
      localStorage.setItem('hasReviewed', 'true');
      setShowReviewModal(false);
    } catch (err) {
      toast.error('Failed to submit feedback');
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return;
    try {
      await api.post('/chat/report', { reporter: user, reportedUser: reportTarget, reason: reportReason });
      toast.success('Report submitted. Our admins will review it shortly.');
      setShowReportDialog(false);
      setReportReason('');
      setReportTarget('');
    } catch (err) {
      toast.error('Failed to submit report');
    }
  };
  return (
    <div className="h-[100dvh] w-full flex bg-[var(--color-bg-secondary)] overflow-hidden text-[var(--color-text-primary)] font-sans">
      
      {/* Mobile Slide-Out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100] md:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-[var(--color-bg-card)] border-l border-[var(--color-border-subtle)] z-[110] md:hidden shadow-[var(--shadow-lg)] flex flex-col"
            >
              <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--text-lg)] text-[var(--color-text-primary)] font-display">Menu</h3>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button onClick={() => { setActivePanel(null); setIsWhiteboardActive(false); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!activePanel && !isWhiteboardActive ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-on-accent)] shadow-[var(--shadow-sm)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]'}`}>
                  <Globe size={20} /> <span className="font-semibold text-[var(--text-sm)]">Home Chat</span>
                </button>
                <button onClick={() => { setActivePanel('editor'); setIsWhiteboardActive(false); setIsMobileMenuOpen(false); setToolMode(selectedChat ? 'collaborative' : 'personal'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePanel === 'editor' ? 'bg-[#A6E22E]/20 text-[#A6E22E] border border-[#A6E22E]/30' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]'}`}>
                  <Terminal size={20} /> <span className="font-semibold text-[var(--text-sm)]">Code Editor</span>
                </button>
                <button onClick={() => { setActivePanel('visualizer'); setIsWhiteboardActive(false); setIsMobileMenuOpen(false); setToolMode(selectedChat ? 'collaborative' : 'personal'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePanel === 'visualizer' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] border border-[var(--color-accent-secondary)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]'}`}>
                  <Layers size={20} /> <span className="font-semibold text-[var(--text-sm)]">DSA Visualizer</span>
                </button>
                <button onClick={() => { setIsWhiteboardActive(true); setActivePanel(null); setIsMobileMenuOpen(false); setToolMode(selectedChat ? 'collaborative' : 'personal'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isWhiteboardActive ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] border border-[var(--color-accent-secondary)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]'}`}>
                  <PenTool size={20} /> <span className="font-semibold text-[var(--text-sm)]">Whiteboard</span>
                </button>
                <button onClick={() => { setActivePanel('templates'); setIsWhiteboardActive(false); setIsMobileMenuOpen(false); setToolMode(selectedChat ? 'collaborative' : 'personal'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePanel === 'templates' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] border border-[var(--color-accent-secondary)]' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]'}`}>
                  <Code2 size={20} /> <span className="font-semibold text-[var(--text-sm)]">Templates</span>
                </button>
                
                <div className="w-full h-px bg-[var(--color-border-subtle)] my-2"></div>
                
                {localStorage.getItem('role') === 'admin' && (
                  <button onClick={() => { setIsMobileMenuOpen(false); navigate('/admin'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-gray-50 border border-[var(--color-border-subtle)]">
                    <ShieldAlert size={20} /> <span className="font-semibold text-[var(--text-sm)]">Admin Panel</span>
                  </button>
                )}
                <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 border border-[var(--color-border-subtle)]">
                  <LogOut size={20} /> <span className="font-semibold text-[var(--text-sm)]">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Area (Left Pane) */}
      <div className={`${rightPaneVisible ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 overflow-hidden flex-col shrink-0 border-r border-[var(--color-border-subtle)] bg-white`}>
        <Sidebar 
          allUsers={allUsers} onlineList={onlineList}
          selectedChat={selectedChat} setSelectedChat={(c) => { setSelectedChat(c); setIsSidebarOpen(false); }}
          user={user} onLogout={handleLogout} unreadCounts={unreadCounts}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Main Chat Area (Right Pane) */}
      <div className={`${!rightPaneVisible ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0 relative bg-[var(--color-bg-base)]`}>
        <header className="h-16 px-4 md:px-6 border-b border-[var(--color-border-subtle)] flex items-center justify-between shrink-0 bg-[var(--color-bg-surface)] z-10">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <button onClick={() => { setSelectedChat(null); setActivePanel(null); setIsWhiteboardActive(false); }} className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1 -ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[var(--text-lg)] truncate text-[var(--color-text-primary)]">
                  {activePanel === 'editor' ? 'Code Editor' : activePanel === 'visualizer' ? 'DSA Visualizer' : activePanel === 'templates' ? 'Templates' : isWhiteboardActive ? 'Whiteboard' : selectedChat ? `@${selectedChat}` : 'Chatify Global'}
                </span>
                {selectedChat && !activePanel && !isWhiteboardActive && onlineList.includes(selectedChat) && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-functional-success)] shadow-sm shrink-0"></span>
                )}
              </div>
              {selectedChat && !activePanel && !isWhiteboardActive && <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)] font-medium">{onlineList.includes(selectedChat) ? 'Online' : 'Offline'}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 shrink-0 overflow-x-auto no-scrollbar pl-2 py-1">
            {selectedChat && selectedChat !== 'placeholder' && selectedChat !== user && (
              <>
                <button onClick={handleStartCall} title="Start Video Call"
                  className="p-2 rounded-[var(--radius-md)] transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-accent-primary)] shrink-0">
                  <Phone size={20} />
                </button>
                <button
                  onClick={() => { setReportTarget(selectedChat); setShowReportDialog(true); }}
                  title="Report User"
                  className="p-2 rounded-[var(--radius-md)] transition-colors text-[var(--color-text-secondary)] hover:bg-[rgba(232,108,108,0.1)] hover:text-[var(--color-functional-danger)] shrink-0">
                  <AlertOctagon size={20} />
                </button>
              </>
            )}
            <div className="w-px h-6 bg-[var(--color-border-subtle)] mx-1 shrink-0 hidden md:block"></div>
            
            {/* Desktop Navigation Tools (Collaborative Context) */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => { setActivePanel(activePanel === 'templates' ? null : 'templates'); setIsWhiteboardActive(false); setToolMode('collaborative'); }} title="Code Templates"
                className={`p-2 rounded-[var(--radius-md)] transition-colors shrink-0 ${activePanel === 'templates' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'}`}>
                <Code2 size={20} />
              </button>
              <button onClick={() => { setActivePanel(activePanel === 'visualizer' ? null : 'visualizer'); setIsWhiteboardActive(false); setToolMode('collaborative'); }} title="DSA Visualizer"
                className={`p-2 rounded-[var(--radius-md)] transition-colors shrink-0 ${activePanel === 'visualizer' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'}`}>
                <Layers size={20} />
              </button>
              <button onClick={() => { setActivePanel(activePanel === 'editor' ? null : 'editor'); setIsWhiteboardActive(false); setToolMode('collaborative'); }} title="JS Editor"
                className={`p-2 rounded-[var(--radius-md)] transition-colors shrink-0 ${activePanel === 'editor' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'}`}>
                <Terminal size={20} />
              </button>
              <button onClick={() => { setIsWhiteboardActive(!isWhiteboardActive); setActivePanel(null); setToolMode('collaborative'); }} title="Whiteboard"
                className={`p-2 rounded-[var(--radius-md)] transition-colors shrink-0 ${isWhiteboardActive ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'}`}>
                {isWhiteboardActive ? <MessageSquare size={20} /> : <PenTool size={20} />}
              </button>
            </div>

            {/* Mobile Navigation Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors shrink-0 ml-1">
              <Menu size={22} />
            </button>
          </div>
        </header>



        {isWhiteboardActive ? (
          <div className="flex-1 overflow-hidden relative">
            <Whiteboard 
              socket={socket} 
              room={toolMode === 'personal' ? `personal_${user}` : (selectedChat || 'global')} 
              initialData={canvasStates[toolMode === 'personal' ? `personal_${user}` : (selectedChat || 'global')]}
              onSave={(dataUrl) => setCanvasStates(prev => ({ ...prev, [toolMode === 'personal' ? `personal_${user}` : (selectedChat || 'global')]: dataUrl }))}
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
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--color-bg-secondary)] relative" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
              {!selectedChat && messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Globe size={48} className="mb-4 text-gray-300" />
                  <p className="font-semibold text-sm text-gray-500">Select a chat to start messaging</p>
                </div>
              )}

              {messages.length > 0 && (
                <div className="flex flex-col min-h-full">
                  <div className="flex-1" />
                  {hasMore && (
                    <button onClick={loadMoreMessages} className="mx-auto mb-6 flex items-center gap-2 text-xs font-semibold text-blue-500 hover:bg-blue-50 transition-colors px-4 py-2 rounded-full">
                      <ChevronUp size={14} /> Load earlier messages
                    </button>
                  )}
                  {messages.map((m, i) => (
                    <MessageBubble key={m._id || i} m={m} user={user} socket={socket} onReply={setReplyToMsg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </main>

            <footer className="px-4 pb-4 md:px-6 md:pb-6 bg-[var(--color-bg-secondary)]">
              {replyToMsg && (
                <div className="mb-2 flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[var(--color-border-subtle)] shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-blue-600">Replying to {replyToMsg.senderName}</p>
                    <p className="text-sm text-[var(--color-text-secondary)] truncate">{replyToMsg.text || '📎 Attachment'}</p>
                  </div>
                  <button type="button" onClick={() => setReplyToMsg(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><X size={16} /></button>
                </div>
              )}

              {pendingFile && (
                <div className="mb-2 flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[var(--color-border-subtle)] shadow-sm">
                  {pendingFile.preview ? (
                    <img src={pendingFile.preview} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText size={20} className="text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{pendingFile.file.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{(pendingFile.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={() => setPendingFile(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><X size={16} /></button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-end gap-2 md:gap-3 relative">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip" />
                
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={selectedChat === 'placeholder'}
                  className="w-12 h-12 rounded-[var(--radius-full)] flex items-center justify-center bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-accent-primary)] transition-colors shrink-0 shadow-[var(--shadow-sm)] disabled:opacity-50">
                  <Paperclip size={20} />
                </button>

                <div className={`flex-1 min-h-[48px] rounded-[var(--radius-full)] bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] flex items-center px-5 shadow-[var(--shadow-sm)] focus-within:border-[var(--color-accent-primary)] focus-within:ring-1 focus-within:ring-[var(--color-accent-primary)] transition-all ${isPhantomMode ? 'ring-2 ring-[var(--color-accent-secondary)] border-[var(--color-accent-secondary)] bg-[rgba(232,168,124,0.1)]' : ''}`}>
                  <input 
                    value={inputText} onChange={handleInputChange} disabled={selectedChat === 'placeholder'}
                    placeholder={isPhantomMode ? "Disappearing message..." : "Message..."}
                    className={`bg-transparent border-none outline-none text-[var(--text-base)] text-[var(--color-text-primary)] w-full py-3 placeholder:text-[var(--color-text-muted)] disabled:opacity-50 ${isPhantomMode ? 'italic' : ''}`}
                  />
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {isPhantomMode && (
                    <div className="absolute -top-8 right-2 bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                      <Ghost size={12} /> Phantom Active
                    </div>
                  )}
                  <button type="submit" disabled={(!inputText.trim() && !pendingFile) || isUploading}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-40 disabled:hover:bg-blue-600 shadow-sm ${isPhantomMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                  </button>
                </div>
              </form>
            </footer>
          </>
        )}
      </div>

      {activeVideoCall && (
        <>
          <VideoCall
            socket={socket}
            currentUser={user}
            peerUser={activeVideoCall.peer}
            isCaller={activeVideoCall.isCaller}
            incomingOffer={activeVideoCall.offer}
            bufferedCandidates={bufferedCandidates}
            onCallEnded={() => {
              clearTimeout(callTimerRef.current);
              clearInterval(callCountdownRef.current);
              setIsCallAccepted(false);
              setCallCountdown(30);
              setActiveVideoCall(null);
              handleCallEnded();
            }}
          />
          {/* Floating countdown banner while waiting for the peer to answer */}
          {activeVideoCall.isCaller && !isCallAccepted && (
            <div className="fixed top-4 inset-x-0 z-[200] flex justify-center pointer-events-none">
              <div className={`flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-lg backdrop-blur-md border transition-all duration-500 ${
                callCountdown <= 10
                  ? 'bg-red-500/90 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                  : 'bg-amber-500/90 text-black border-amber-400'
              }`}>
                <Timer size={14} className={callCountdown <= 10 ? 'animate-spin' : ''} />
                <span>Auto-hangup in {callCountdown}s — waiting for @{activeVideoCall.peer}</span>
              </div>
            </div>
          )}
        </>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
          <div className="bg-[#0e1117] border border-white/10 p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-accent-indigo/20 text-accent-indigo rounded-full flex items-center justify-center animate-bounce mb-6">
              <Phone size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2">Incoming Video Call</h3>
            <p className="text-slate-400 text-sm mb-6">@{incomingCall.from} is calling you...</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={handleDeclineCall} 
                className="flex-1 py-3 bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white rounded-2xl transition-all font-bold"
              >
                Decline
              </button>
              <button 
                onClick={handleAcceptCall} 
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all font-bold"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
          <div className="bg-[#0c091f]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md w-full mx-4 shadow-2xl flex flex-col relative">
            <button 
              onClick={() => {
                setShowReviewModal(false);
                localStorage.setItem('hasReviewed', 'true');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <MessageSquare size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">Help Us Optimize Call Quality</h3>
              <p className="text-slate-400 text-xs">How was your video calling experience? Your feedback helps us build a smoother WebRTC tunnel.</p>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`text-3xl hover:scale-125 transition-transform ${
                    star <= userRating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Tell us about the latency, video clarity, or audio delays..."
              className="bg-black/40 border border-white/5 focus:border-indigo-500/50 rounded-2xl p-4 text-sm font-semibold text-white w-full h-24 outline-none placeholder:text-slate-700 resize-none mb-6"
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
            />

            <button
              onClick={submitFeedback}
              disabled={userRating === 0}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-3.5 rounded-2xl font-extrabold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(99,102,241,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* ── Admin Warning Modal ── */}
      {showAdminWarning && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-lg">
          <div className="bg-[#0f0a1e]/90 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl max-w-md w-full mx-4 shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col relative">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
                <ShieldAlert size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">⚠️ Official Warning</h3>
                <p className="text-xs text-red-400 font-bold uppercase tracking-widest">From Chatify Administration</p>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-5">
              <p className="text-sm font-semibold text-slate-200 leading-relaxed">{adminWarningText}</p>
            </div>
            <p className="text-xs text-slate-500 mb-5">This warning has been recorded on your account. Repeated violations may result in account suspension.</p>
            <button
              onClick={() => setShowAdminWarning(false)}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              I Understand &amp; Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* ── Call Timeout Roast Modal ── */}
      {callTimedOut && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-lg">
          <div className="bg-[#0f0a1e]/90 backdrop-blur-xl border border-amber-500/30 p-8 rounded-3xl max-w-md w-full mx-4 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col items-center text-center relative">
            <button onClick={() => setCallTimedOut(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
            <div className="text-5xl mb-4">📵</div>
            <h3 className="text-xl font-extrabold text-white mb-1">Call Timed Out!</h3>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-5">30 seconds of pure rejection 💅</p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-left">
              <p className="text-sm text-slate-300 leading-relaxed italic">{roastMessage}</p>
            </div>
            <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2.5 mb-6">
              <p className="text-xs text-amber-400 font-bold">✉️ Email notification sent to @{timedOutCallPeer}</p>
            </div>
            <button
              onClick={() => setCallTimedOut(false)}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Okay, I&apos;ll Survive 💪
            </button>
          </div>
        </div>
      )}

      {/* ── Report User Dialog ── */}
      {showReportDialog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-lg">
          <div className="bg-[#0f0a1e]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl flex flex-col relative">
            <button onClick={() => { setShowReportDialog(false); setReportReason(''); }} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <AlertOctagon size={18} className="text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Report User</h3>
                <p className="text-xs text-slate-500 mt-0.5">Reporting @{reportTarget}</p>
              </div>
            </div>
            <textarea
              placeholder="Describe the issue clearly... (e.g. harassment, spam, inappropriate content)"
              className="bg-black/40 border border-white/5 focus:border-rose-500/50 rounded-2xl p-4 text-xs font-semibold text-white w-full h-28 outline-none placeholder:text-slate-700 resize-none mb-4"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <button
              onClick={submitReport}
              disabled={!reportReason.trim()}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-extrabold uppercase tracking-widest text-xs disabled:opacity-30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
