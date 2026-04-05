// components/Chat/ChatList.js
import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMinutes = Math.floor((now - date) / 60000);

  if (diffInMinutes < 1) return 'à l\'instant';
  if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`;
  if (diffInMinutes < 1440) return `il y a ${Math.floor(diffInMinutes / 60)} h`;
  if (diffInMinutes < 10080) return `il y a ${Math.floor(diffInMinutes / 1440)} j`;
  return date.toLocaleDateString('fr-FR');
};

const ChatList = ({ currentUser, onSelectUser, selectedUserId, onUnreadCountChange }) => {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentUser) {
      chatService.setCurrentUser(currentUser);
      loadConversations();
    }
  }, [currentUser]);

  const loadConversations = () => {
    const convs = chatService.getAllConversations();
    setConversations(convs);
    
    if (onUnreadCountChange) {
      const unreadCount = convs.reduce((total, conv) => total + conv.unreadCount, 0);
      onUnreadCountChange(unreadCount);
    }
  };

  const handleSelectUser = (contact) => {
    chatService.markMessagesAsRead(contact.id);
    onSelectUser(contact);
    loadConversations();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contact.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-900 rounded-lg overflow-hidden flex flex-col">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <h3 className="text-white font-semibold text-lg mb-2">
          Messages ({conversations.length} contact{conversations.length > 1 ? 's' : ''})
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
            </svg>
            <p>Aucun contact disponible</p>
            <p className="text-sm text-center mt-2">
              {currentUser?.role === 'formateur' 
                ? 'Aucun apprenant inscrit pour le moment' 
                : currentUser?.role === 'user'
                ? 'Aucun formateur disponible'
                : 'Aucun utilisateur trouvé'}
            </p>
          </div>
        ) : (
          filteredConversations.map(({ contact, lastMessage, unreadCount }) => (
            <button
              key={contact.id}
              onClick={() => handleSelectUser(contact)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800 transition-colors ${
                selectedUserId === contact.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                  {contact.avatar || (contact.role === 'formateur' ? '🎓' : '👤')}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-white font-medium">{contact.fullName}</h4>
                  {lastMessage && (
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-400 truncate max-w-[180px]">
                    {lastMessage?.message || 'Cliquez pour commencer à discuter'}
                  </p>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;