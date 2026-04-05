// components/Chat/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';
import chatService from '../../services/chatService';

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'à l\'instant';
  if (diff < 3600000) return `il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const ChatWindow = ({ currentUser, selectedUser, onClose, onMessageSent, onVideoCall, onAudioCall }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentUser && selectedUser) {
      chatService.setCurrentUser(currentUser);
      loadMessages();
      
      // Marquer les messages comme lus
      chatService.markMessagesAsRead(selectedUser.id);
    }
  }, [currentUser, selectedUser]);

  const loadMessages = () => {
    const loadedMessages = chatService.getMessages(selectedUser.id);
    setMessages(loadedMessages);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = chatService.sendMessage(selectedUser.id, newMessage);
    
    if (messageData) {
      setMessages([...messages, messageData]);
      setNewMessage('');
      
      if (onMessageSent) {
        onMessageSent();
      }
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleVideoCall = () => {
    if (onVideoCall) {
      onVideoCall();
    }
  };

  const handleAudioCall = () => {
    if (onAudioCall) {
      onAudioCall();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* En-tête avec boutons d'appel */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              {selectedUser.avatar || (selectedUser.role === 'formateur' ? '🎓' : '👤')}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="text-white font-semibold">{selectedUser.fullName}</h3>
            <p className="text-xs text-blue-200">
              {selectedUser.role === 'formateur' ? '🎓 Formateur' : '👤 Apprenant'} • {selectedUser.matricule}
            </p>
          </div>
        </div>
        
        {/* Boutons d'appel et options */}
        <div className="flex items-center gap-2">
          {/* Bouton Appel Audio */}
          <button
            onClick={handleAudioCall}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white relative group"
            title="Appel audio"
          >
            <Phone className="w-5 h-5" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Appel audio
            </span>
          </button>
          
          {/* Bouton Appel Vidéo */}
          <button
            onClick={handleVideoCall}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white relative group"
            title="Appel vidéo"
          >
            <Video className="w-5 h-5" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Appel vidéo
            </span>
          </button>
          
          {/* Séparateur */}
          <div className="w-px h-8 bg-white/20 mx-1"></div>
          
          {/* Bouton Plus d'options */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white"
              title="Plus d'options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {/* Menu d'options */}
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-10 overflow-hidden">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Envoyer un email
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Voir le profil
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Supprimer la conversation
                </button>
              </div>
            )}
          </div>
          
          {/* Bouton Fermer */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white"
            title="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <p className="text-lg font-medium text-white mb-1">Nouvelle conversation</p>
            <p className="text-sm text-center max-w-xs">
              Envoyez un message à {selectedUser.prenom} pour démarrer la discussion
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUser.id;
            const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[75%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl p-3 ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}>
                    <p className="text-sm break-words leading-relaxed">{message.message}</p>
                    <div className={`text-xs mt-1.5 flex items-center gap-1 ${
                      isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {isOwnMessage && message.read && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                {!isOwnMessage && showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center text-sm mr-2 order-1 shadow-lg">
                    {selectedUser.avatar || (selectedUser.role === 'formateur' ? '🎓' : '👤')}
                  </div>
                )}
                {!isOwnMessage && !showAvatar && (
                  <div className="w-8 mr-2 order-1"></div>
                )}
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-700 rounded-2xl p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Saisie */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-900 border-t border-gray-700">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder={`Écrivez à ${selectedUser.prenom}...`}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-purple-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 0.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;