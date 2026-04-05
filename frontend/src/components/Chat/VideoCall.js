// components/Chat/VideoCall.js
import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff, Mic, MicOff, Video, VideoOff,
  Maximize2, Minimize2, Users, X
} from 'lucide-react';
import videoCallService from '../../services/videoCallService';
import { VideoConference, LiveKitRoom, ParticipantTile } from '@livekit/components-react';
import '@livekit/components-styles';

const VideoCall = ({ currentUser, selectedUser, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionState, setConnectionState] = useState('connecting');
  
  const videoContainerRef = useRef(null);
  const callIntervalRef = useRef(null);
  const callId = `${currentUser.id}_${selectedUser.id}_${Date.now()}`;

  useEffect(() => {
    startCall();
    
    return () => {
      endCall();
    };
  }, []);

  useEffect(() => {
    if (connectionState === 'connected') {
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
    };
  }, [connectionState]);

  const startCall = async () => {
    try {
      const room = await videoCallService.createCall(callId, currentUser.fullName);
      
      room.on('participantConnected', (participant) => {
        setParticipants(prev => [...prev, participant]);
      });
      
      room.on('participantDisconnected', (participant) => {
        setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
      });
      
      room.on('connected', () => {
        setConnectionState('connected');
      });
      
      room.on('disconnected', () => {
        setConnectionState('disconnected');
        onClose();
      });
      
    } catch (error) {
      console.error("Erreur lors du démarrage de l'appel:", error);
      setConnectionState('failed');
    }
  };

  const endCall = async () => {
    await videoCallService.leaveCall();
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
    }
    onClose();
  };

  const toggleMute = () => {
    const muted = videoCallService.toggleMicrophone();
    setIsMuted(muted);
  };

  const toggleVideo = () => {
    const videoOff = videoCallService.toggleCamera();
    setIsVideoOff(videoOff);
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (connectionState === 'failed') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-white text-xl font-bold mb-2">Erreur de connexion</h3>
          <p className="text-gray-400 mb-6">Impossible de démarrer l'appel vidéo</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={videoContainerRef}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Interface LiveKit */}
      <LiveKitRoom
        serverUrl="wss://your-livekit-server.com"
        token={videoCallService.token}
        connect={connectionState === 'connected'}
      >
        <VideoConference />
      </LiveKitRoom>

      {/* Informations d'appel */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2">
        <p className="text-white font-medium">{selectedUser.fullName}</p>
        <p className="text-xs text-gray-300">
          {connectionState === 'connecting' && 'Connexion en cours...'}
          {connectionState === 'connected' && `Durée: ${formatDuration(callDuration)}`}
        </p>
      </div>

      {/* Participants */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-2xl px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white" />
          <span className="text-white text-sm">{participants.length + 1}</span>
        </div>
      </div>

      {/* Contrôles */}
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
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all"
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

      {/* État de connexion */}
      {connectionState === 'connecting' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Mise en relation...</p>
            <p className="text-gray-400 text-sm">Appel de {selectedUser.fullName}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;