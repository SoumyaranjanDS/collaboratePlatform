import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Menu, Send, Mic, Globe } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const socket = io('http://localhost:9000', { autoConnect: false });

const Chat = ({ user, setAuth }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [onlineList, setOnlineList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();
    socket.emit('join-chat', user);
    
    axios.get('http://localhost:9000/api/chat/users').then(res => setAllUsers(res.data));

    socket.on('message-received', (msg) => {
      const isGlobalMsg = msg.recipientName === null && selectedChat === null;
      const isPrivateMsg = (msg.senderName === selectedChat || msg.recipientName === selectedChat);
      if (isGlobalMsg || isPrivateMsg) {
        setMessages(prev => [...prev, msg]);
      } else {
        toast(`New message from ${msg.senderName}`, { icon: '💬' });
      }
    });

    socket.on('load-messages', (history) => setMessages(history));
    socket.on('online-users-list', (list) => setOnlineList(list));
    
    socket.on('user-status-change', (data) => {
      if (data.username !== user) {
        toast(`${data.username} is ${data.status}`, { icon: data.status === 'online' ? '🟢' : '⚫' });
      }
    });

    return () => { socket.disconnect(); socket.off(); };
  }, [user, selectedChat]);

  useEffect(() => {
    socket.emit('fetch-history', { sender: user, recipient: selectedChat });
  }, [selectedChat, user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    socket.emit('send-message', { senderName: user, recipientName: selectedChat, text: inputText });
    setInputText('');
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
      />

      <div className="flex-1 flex flex-col min-w-0 bg-dark-bg">
        {/* Header */}
        <header className="h-24 px-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-full shadow-neo-out flex items-center justify-center mr-2">
              <Menu size={20} />
            </button>
            <div className="w-12 h-12 rounded-full shadow-neo-out p-0.5">
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
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                {selectedChat ? (
                  <>{onlineList.includes(selectedChat) ? 'Active Now' : 'Offline'}</>
                ) : (
                  <>{onlineList.length} Active Members</>
                )}
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.senderName === user ? 'items-end' : 'items-start'} animate-slide-up`}>
              <div className={`
                max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-4xl text-sm font-semibold leading-relaxed shadow-neo-out
                ${m.senderName === user 
                  ? 'bg-accent-red text-white rounded-tr-none shadow-red-glow' 
                  : 'bg-bubble-received text-slate-300 rounded-tl-none border border-white/5'}
              `}>
                {m.text}
                <span className={`block text-[9px] mt-2 opacity-60 ${m.senderName === user ? 'text-right' : 'text-left'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <footer className="p-6 pt-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-4">
            <div className="flex-1 shadow-neo-in rounded-4xl px-6 py-4 flex items-center gap-4 bg-dark-bg/50">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedChat ? `Message ${selectedChat}...` : "Broadcast to everyone..."}
                className="bg-transparent border-none outline-none text-sm font-semibold text-white w-full"
              />
            </div>
            <button type="submit" className="w-14 h-14 bg-accent-red text-white rounded-full flex items-center justify-center shadow-red-glow">
              <Send size={22} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default Chat;
