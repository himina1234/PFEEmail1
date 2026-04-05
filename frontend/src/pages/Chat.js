// pages/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import chatService from '../services/chatService';
import { 
  ArrowLeft, Phone, Video, X, Mic, MicOff, VideoOff, 
  PhoneOff, Maximize2, Minimize2, Users, MoreVertical,
  Camera, Settings, Volume2, VolumeX, Share2
} from 'lucide-react';

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // États pour l'appel vidéo
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState(null); // 'calling', 'connected', 'ended'
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callIntervalRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  const navigate = useNavigate();

  // Simuler un appel entrant (dans une vraie app, ce serait via WebRTC/Socket)
  useEffect(() => {
    // Simulation d'appel entrant après 10 secondes (pour démo)
    const timer = setTimeout(() => {
      if (selectedUser && !isVideoCall && !isAudioCall) {
        setIncomingCall({
          from: selectedUser,
          type: 'video'
        });
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [selectedUser]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(savedUser);
    setCurrentUser(user);
    chatService.setCurrentUser(user);
    
    const count = chatService.getUnreadCount();
    setUnreadCount(count);

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  // Gestion de la durée d'appel
  useEffect(() => {
    if (callStatus === 'connected') {
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (callStatus === 'ended') {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
      setTimeout(() => {
        setCallStatus(null);
        setCallDuration(0);
        setIsVideoCall(false);
        setIsAudioCall(false);
      }, 2000);
    }
    
    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
    };
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    setCallStatus('calling');
    setIncomingCall(null);
    
    // Simuler la connexion après 2 secondes
    setTimeout(() => {
      setCallStatus('connected');
      startLocalVideo();
    }, 2000);
  };

  const startAudioCall = () => {
    setIsAudioCall(true);
    setCallStatus('calling');
    setIncomingCall(null);
    
    setTimeout(() => {
      setCallStatus('connected');
    }, 2000);
  };

  const acceptCall = () => {
    if (incomingCall.type === 'video') {
      startVideoCall();
    } else {
      startAudioCall();
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
  };

  const endCall = () => {
    setCallStatus('ended');
    stopLocalVideo();
  };

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err);
    }
  };

  const stopLocalVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleMute = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!isFullscreen) {
      videoContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    if (isMobileView) {
      setIsChatOpen(false);
    } else {
      setSelectedUser(null);
    }
  };

  const handleMessageSent = () => {
    if (currentUser) {
      const count = chatService.getUnreadCount();
      setUnreadCount(count);
    }
  };

  // Rendu de l'appel vidéo
  const renderVideoCall = () => (
    <div 
      ref={videoContainerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Vidéo distante (plein écran) */}
      <video
        ref={remoteVideoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        poster="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop"
      />
      
      {/* Vidéo locale (miniature) */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative w-40 h-56 md:w-56 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-lg text-xs text-white">
            Vous
          </div>
        </div>
      </div>
      
      {/* Informations d'appel */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2">
        <p className="text-white font-medium">{selectedUser?.fullName}</p>
        <p className="text-xs text-gray-300">
          {callStatus === 'calling' && 'Appel en cours...'}
          {callStatus === 'connected' && `Durée: ${formatDuration(callDuration)}`}
          {callStatus === 'ended' && 'Appel terminé'}
        </p>
      </div>
      
      {/* Contrôles d'appel */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-10">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
        </button>
        
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all animate-pulse"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-6 h-6 text-white" /> : <Maximize2 className="w-6 h-6 text-white" />}
        </button>
      </div>
      
      {/* Message de fin d'appel */}
      {callStatus === 'ended' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneOff className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-white text-xl font-bold">Appel terminé</p>
            <p className="text-gray-400 mt-2">Durée: {formatDuration(callDuration)}</p>
          </div>
        </div>
      )}
    </div>
  );

  // Rendu de l'appel audio
  const renderAudioCall = () => (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        {/* Avatar */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-6xl shadow-2xl animate-pulse">
            {selectedUser?.avatar || (selectedUser?.role === 'formateur' ? '🎓' : '👤')}
          </div>
          <div className="absolute bottom-0 right-1/3 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
        </div>
        
        {/* Informations */}
        <h2 className="text-2xl font-bold text-white mb-2">{selectedUser?.fullName}</h2>
        <p className="text-gray-400 mb-8">
          {callStatus === 'calling' && 'Appel en cours...'}
          {callStatus === 'connected' && `Durée: ${formatDuration(callDuration)}`}
          {callStatus === 'ended' && 'Appel terminé'}
        </p>
        
        {/* Contrôles */}
        <div className="flex justify-center gap-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all animate-pulse"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={toggleMute}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <Volume2 className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );

  // Rendu de l'appel entrant
  const renderIncomingCall = () => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in duration-300">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-white/20">
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl shadow-xl">
            {incomingCall?.from?.avatar || (incomingCall?.from?.role === 'formateur' ? '🎓' : '👤')}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{incomingCall?.from?.fullName}</h3>
        <p className="text-gray-400 mb-6">
          {incomingCall?.type === 'video' ? '📹 Appel vidéo entrant' : '🎵 Appel audio entrant'}
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={acceptCall}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-full font-bold text-white transition-all flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Accepter
          </button>
          <button
            onClick={rejectCall}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full font-bold text-white transition-all flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Refuser
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-16">
        <div className="container mx-auto h-full p-4">
          <div className="h-full rounded-2xl overflow-hidden shadow-2xl flex">
            {/* Sidebar des conversations */}
            <div className={`${isChatOpen && isMobileView ? 'hidden' : 'w-full md:w-1/3'} bg-gray-900/50 backdrop-blur-sm`}>
              <ChatList
                currentUser={currentUser}
                onSelectUser={handleSelectUser}
                selectedUserId={selectedUser?.id}
                onUnreadCountChange={setUnreadCount}
              />
            </div>

            {/* Fenêtre de chat */}
            <div className={`${!isChatOpen && isMobileView ? 'hidden' : 'w-full md:w-2/3'} bg-gray-800/50 backdrop-blur-sm`}>
              {selectedUser ? (
                <ChatWindow
                  currentUser={currentUser}
                  selectedUser={selectedUser}
                  onClose={handleCloseChat}
                  onMessageSent={handleMessageSent}
                  onVideoCall={startVideoCall}
                  onAudioCall={startAudioCall}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white mb-2">Messagerie AP Learning</p>
                  <p className="text-gray-400 text-center max-w-md">
                    Sélectionnez une conversation pour commencer à discuter,<br />
                    ou appelez directement vos contacts
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appel vidéo */}
      {isVideoCall && renderVideoCall()}
      
      {/* Appel audio */}
      {isAudioCall && renderAudioCall()}
      
      {/* Appel entrant */}
      {incomingCall && renderIncomingCall()}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 0.5s infinite;
        }
      `}</style>
    </>
  );
};

export default Chat;