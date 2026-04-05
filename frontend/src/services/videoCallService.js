// services/videoCallService.js
import { Room, RoomEvent, Track } from 'livekit-client';

class VideoCallService {
  constructor() {
    this.room = null;
    this.localTrack = null;
    this.currentCallId = null;
  }

  // Créer un salon d'appel
  async createCall(callId, userName) {
    this.currentCallId = callId;
    
    // Configuration du serveur LiveKit (à remplacer par votre serveur)
    const wsUrl = 'wss://your-livekit-server.com';
    const token = await this.getToken(callId, userName);
    
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    await this.room.connect(wsUrl, token);
    
    // Activer la caméra et le micro
    await this.room.localParticipant.enableCameraAndMicrophone();
    
    return this.room;
  }

  // Rejoindre un appel existant
  async joinCall(callId, userName) {
    return this.createCall(callId, userName);
  }

  // Quitter l'appel
  async leaveCall() {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
    this.currentCallId = null;
  }

  // Couper/Activer le micro
  toggleMicrophone() {
    if (this.room) {
      const publication = this.room.localParticipant.getTrack(Track.Source.Microphone);
      if (publication) {
        publication.track?.setMuted(!publication.track.isMuted);
        return !publication.track.isMuted;
      }
    }
    return false;
  }

  // Couper/Activer la caméra
  toggleCamera() {
    if (this.room) {
      const publication = this.room.localParticipant.getTrack(Track.Source.Camera);
      if (publication) {
        publication.track?.setMuted(!publication.track.isMuted);
        return !publication.track.isMuted;
      }
    }
    return false;
  }

  // Obtenir le token (à faire via votre backend)
  async getToken(roomName, userName) {
    // Appel à votre backend pour générer un token
    const response = await fetch('/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, userName })
    });
    const data = await response.json();
    return data.token;
  }

  // Écouter les événements
  onParticipantConnected(callback) {
    this.room?.on(RoomEvent.ParticipantConnected, callback);
  }

  onParticipantDisconnected(callback) {
    this.room?.on(RoomEvent.ParticipantDisconnected, callback);
  }
}

export default new VideoCallService();