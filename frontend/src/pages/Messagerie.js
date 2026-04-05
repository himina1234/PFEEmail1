import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Messagerie = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger l'utilisateur connecté
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(savedUser));
    
    // Charger tous les utilisateurs
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    
    // Charger les messages
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [navigate]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedContact) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId: selectedContact.id,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // Simuler une réponse
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        text: `✅ Message reçu: "${inputMessage}"`,
        senderId: selectedContact.id,
        senderName: selectedContact.fullName,
        receiverId: currentUser.id,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // Filtrer les contacts (exclure l'utilisateur connecté)
  const contacts = users.filter(u => u.id !== currentUser.id);

  // Filtrer les messages pour la conversation actuelle
  const conversationMessages = messages.filter(msg => 
    (msg.senderId === currentUser.id && msg.receiverId === selectedContact?.id) ||
    (msg.senderId === selectedContact?.id && msg.receiverId === currentUser.id)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{currentUser.avatar}</div>
              <div>
                <h2 className="font-bold">{currentUser.fullName}</h2>
                <p className="text-xs opacity-90">{currentUser.matricule}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-3">
              Contacts ({contacts.length})
            </h3>
            {contacts.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>Aucun contact disponible</p>
              </div>
            ) : (
              contacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedContact?.id === contact.id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl">{contact.avatar}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{contact.prenom} {contact.nom}</p>
                    <p className="text-xs text-gray-500">{contact.matricule}</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{selectedContact.avatar}</div>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedContact.prenom} {selectedContact.nom}</h3>
                  <p className="text-xs text-gray-500">{selectedContact.matricule}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Appel audio">📞</button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition" title="Appel vidéo">📹</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {conversationMessages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Aucun message, commencez la conversation !</p>
                </div>
              ) : (
                conversationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${msg.senderId === currentUser.id ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg p-3 ${
                        msg.senderId === currentUser.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 shadow'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tapez un message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-600">Sélectionnez un contact</h3>
              <p className="text-gray-400 mt-2">Choisissez un contact pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messagerie;