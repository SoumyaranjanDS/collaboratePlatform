import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, MessageSquare, Globe, LayoutDashboard } from 'lucide-react';

const Sidebar = ({ user, allUsers, onlineList, onLogout, selectedChat, setSelectedChat, unreadCounts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredUsers = allUsers.filter((u) => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col min-h-0 p-6 bg-dark-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full shadow-neo-out p-0.5">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} className="rounded-full" alt="avatar" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Chats</h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 shrink-0">
        <div className="relative shadow-neo-in rounded-3xl px-5 py-3 flex items-center gap-3">
          <Search size={18} className="text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Global Chat Button */}
      <div 
        onClick={() => { setSelectedChat(null); }}
        className={`shrink-0 flex items-center justify-between p-4 rounded-2xl mb-6 cursor-pointer transition-all ${!selectedChat ? 'shadow-neo-in text-accent-red' : 'shadow-neo-out text-slate-400'}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-800 shadow-neo-out shrink-0">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Global Chat</h3>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-60">Public Room</p>
          </div>
        </div>
        {unreadCounts['global'] > 0 && (
          <span className="w-6 h-6 bg-accent-red rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-red-glow animate-bounce shrink-0">
            {unreadCounts['global']}
          </span>
        )}
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0 [&::-webkit-scrollbar]:hidden">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Direct Messages</p>
        {filteredUsers.length > 0 ? (
          filteredUsers.filter(u => u.username !== user).map((u) => (
            <div 
              key={u._id} 
              onClick={() => { setSelectedChat(u.username); }}
              className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${selectedChat === u.username ? 'shadow-neo-in bg-white/5' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative p-0.5 rounded-full shadow-neo-out shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username} />
                  </div>
                  {onlineList.includes(u.username) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-bg rounded-full shadow-lg"></div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-sm truncate ${selectedChat === u.username ? 'text-white' : 'text-slate-400'}`}>{u.username}</h3>
                  <p className="text-[10px] text-slate-600 truncate font-medium">
                    {onlineList.includes(u.username) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              {unreadCounts[u.username] > 0 && (
                <span className="w-6 h-6 bg-accent-red rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-red-glow animate-bounce shrink-0">
                  {unreadCounts[u.username]}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10"><p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No users</p></div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between px-2 shrink-0">
        <button 
          className="w-12 h-12 rounded-full shadow-neo-out flex items-center justify-center text-slate-500 hover:text-white transition-all active:shadow-neo-in"
          onClick={() => navigate('/')}
          title="Home Dashboard"
        >
          <LayoutDashboard size={20} />
        </button>

        <button 
          className={`w-12 h-12 rounded-full shadow-neo-out flex items-center justify-center transition-all ${!selectedChat ? 'text-accent-red shadow-red-glow' : 'text-slate-500'}`} 
          onClick={() => { setSelectedChat(null); }}
          title="Global Chat"
        >
          <MessageSquare size={20} />
        </button>

        <button 
          className="w-12 h-12 rounded-full shadow-neo-out flex items-center justify-center text-slate-500 hover:text-red-500 transition-all active:shadow-neo-in" 
          onClick={onLogout}
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
