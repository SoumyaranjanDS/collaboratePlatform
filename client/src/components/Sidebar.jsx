import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, MessageSquare, Globe, ShieldAlert, MoreVertical, Menu, Terminal, PenTool, Layers, Code2 } from 'lucide-react';

const Sidebar = ({ user, allUsers, onlineList, onLogout, selectedChat, setSelectedChat, unreadCounts, onOpenMobileMenu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredUsers = allUsers.filter((u) => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col min-h-0 bg-white">
      {/* Header Profile & Menu */}
      <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between shrink-0 bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-3">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} className="w-10 h-10 rounded-full border border-gray-200 bg-white" alt="avatar" />
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Chats</h2>
        </div>
        
        <div className="relative flex items-center gap-1">
          <button onClick={onOpenMobileMenu} className="p-2 rounded-full hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-[var(--color-border-subtle)] shrink-0">
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 flex items-center gap-3 focus-within:border-[var(--color-text-primary)] focus-within:ring-1 focus-within:ring-[var(--color-text-primary)] transition-all">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] w-full placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Global Chat Button */}
        <div 
          onClick={() => setSelectedChat(null)}
          className={`flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-gray-50 ${!selectedChat ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${!selectedChat ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              <Globe size={24} />
            </div>
            <div>
              <h3 className={`font-semibold text-base ${!selectedChat ? 'text-blue-700' : 'text-[var(--color-text-primary)]'}`}>Global Chat</h3>
              <p className="text-xs text-gray-500 font-medium">Public Room</p>
            </div>
          </div>
          {unreadCounts['global'] > 0 && (
            <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {unreadCounts['global']}
            </span>
          )}
        </div>

        <div className="pt-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.filter(u => u.username !== user && u.username !== 'admin').map((u) => (
              <div 
                key={u._id} 
                onClick={() => setSelectedChat(u.username)}
                className={`flex items-center justify-between px-4 py-3 mx-2 my-1 rounded-xl cursor-pointer transition-colors ${selectedChat === u.username ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username} className="w-12 h-12 rounded-full border border-gray-200 bg-white" />
                    {onlineList.includes(u.username) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-semibold text-base truncate ${selectedChat === u.username ? 'text-blue-700' : 'text-[var(--color-text-primary)]'}`}>{u.username}</h3>
                    <p className="text-xs text-gray-500 truncate font-medium">
                      {onlineList.includes(u.username) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                {unreadCounts[u.username] > 0 && (
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {unreadCounts[u.username]}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10"><p className="text-gray-400 text-sm font-medium">No users found</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
