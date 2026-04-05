// components/ChatbotIntelligent.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Loader2, History, Mic, MicOff } from 'lucide-react';

const ChatbotIntelligent = ({ userId, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        setTimeout(() => handleSendMessage(transcript), 100);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Message de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeMessage = "Bonjour ! Je suis l'assistant intelligent d'Algérie Poste. ";
      
      if (userRole === 'admin') {
        welcomeMessage += "En tant qu'administrateur, je peux vous aider à gérer les utilisateurs, les formations, et vous donner des statistiques détaillées. 📊";
      } else if (userRole === 'formateur') {
        welcomeMessage += "En tant que formateur, je peux vous aider à suivre vos apprenants, planifier vos cours, et répondre à vos questions pédagogiques. 🎓";
      } else if (userRole === 'user') {
        welcomeMessage += "En tant qu'apprenant, je peux vous aider avec vos cours, votre planning, et répondre à toutes vos questions sur la formation. 📚";
      } else {
        welcomeMessage += "Je peux vous renseigner sur nos formations, les inscriptions, et répondre à toutes vos questions ! 🤖";
      }
      
      setMessages([{
        id: 1,
        text: welcomeMessage + "\n\nPosez-moi votre question en français.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [userRole]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chatbot/message`, {
        message: messageToSend,
        userId: userId,
        userRole: userRole
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur chatbot:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants. Si le problème persiste, contactez votre administrateur.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const quickQuestions = userRole === 'admin' ? [
    "Statistiques globales",
    "Liste des utilisateurs",
    "Formations disponibles",
    "Gestion des apprenants"
  ] : userRole === 'formateur' ? [
    "Mes apprenants",
    "Planning des cours",
    "Comment évaluer ?",
    "Ressources pédagogiques"
  ] : [
    "Quelles formations ?",
    "Comment postuler ?",
    "Planning des cours",
    "Contact et adresse"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 z-50 group animate-bounce"
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          ●
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl transition-all duration-300 z-50 flex flex-col ${isMinimized ? 'w-80 h-14' : 'w-[500px] h-[650px]'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={24} />
          <div>
            <h3 className="font-bold">Assistant AP Learning</h3>
            <p className="text-xs text-blue-200">
              {userRole === 'admin' ? 'Admin' : userRole === 'formateur' ? 'Formateur' : 'Apprenant'} • 24h/24
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded transition"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  } shadow-md`}>
                    {message.sender === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                  </div>
                  <div>
                    <div className={`rounded-2xl p-3 ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-sm text-gray-500">réfléchit...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(question)}
                  className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-blue-50 hover:border-blue-300 transition whitespace-nowrap shadow-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input avec reconnaissance vocale */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question en français..."
                className="flex-1 resize-none border border-gray-300 rounded-xl p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                rows="1"
              />
              <button
                onClick={startVoiceRecognition}
                className={`p-2 rounded-xl transition ${isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Dictée vocale"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              💡 Assistant intelligent 24h/24 - Posez-moi toutes vos questions !
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotIntelligent;