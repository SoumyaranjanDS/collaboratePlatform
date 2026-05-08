import React, { useState } from 'react';
import { LogOut, Search, MessageSquare, Globe } from 'lucide-react';

const Sidebar = ({ user, allUsers, onlineList, isOpen, setIsOpen, onLogout, selectedChat, setSelectedChat }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = allUsers.filter((u) => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 w-80 bg-dark-bg z-50 transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-white/5
      `}>
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full shadow-neo-out p-0.5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} className="rounded-full" alt="avatar" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Chats</h2>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative shadow-neo-in rounded-3xl px-5 py-3 flex items-center gap-3">
              <Search size={18} className="text-slate-500" />
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
            onClick={() => { setSelectedChat(null); setIsOpen(false); }}
            className={`flex items-center gap-4 p-4 rounded-2xl mb-6 cursor-pointer transition-all ${!selectedChat ? 'shadow-neo-in text-accent-red' : 'shadow-neo-out text-slate-400'}`}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-800 shadow-neo-out">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Global Chat</h3>
              <p className="text-[10px] uppercase tracking-widest font-black opacity-60">Everyone is here</p>
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Direct Messages</p>
            {filteredUsers.length > 0 ? (
              filteredUsers.filter(u => u.username !== user).map((u) => (
                <div 
                  key={u._id} 
                  onClick={() => { setSelectedChat(u.username); setIsOpen(false); }}
                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${selectedChat === u.username ? 'shadow-neo-in bg-white/5' : 'hover:bg-white/5'}`}
                >
                  <div className="relative p-0.5 rounded-full shadow-neo-out">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username} />
                    </div>
                    {onlineList.includes(u.username) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-bg rounded-full shadow-lg"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`font-bold text-sm truncate ${selectedChat === u.username ? 'text-white' : 'text-slate-400'}`}>{u.username}</h3>
                      <span className="text-[9px] text-slate-600 font-bold">12:35</span>
                    </div>
                    <p className="text-[10px] text-slate-600 truncate font-medium">
                      {onlineList.includes(u.username) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10"><p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No users</p></div>
            )}
          </div>

          {/* Bottom Nav */}
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-6">
            <button className={`w-12 h-12 rounded-full shadow-neo-out flex items-center justify-center ${!selectedChat ? 'text-accent-red' : 'text-slate-500'}`} onClick={() => setSelectedChat(null)}>
              <MessageSquare size={20} />
            </button>
            <button className="w-12 h-12 rounded-full shadow-neo-out flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors" onClick={onLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
