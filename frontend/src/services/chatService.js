// services/chatService.js
class ChatService {
  constructor() {
    this.currentUser = null;
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  // Récupérer tous les utilisateurs (vos comptes réels)
  getAllUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  // Récupérer les contacts disponibles pour l'utilisateur actuel
  getAvailableContacts() {
    if (!this.currentUser) return [];
    
    const allUsers = this.getAllUsers();
    const currentUserData = allUsers.find(u => u.id === this.currentUser.id);
    
    if (!currentUserData) return [];
    
    let contacts = [];
    
    if (this.currentUser.role === 'formateur') {
      // FORMATEUR: voir TOUS les apprenants (pas de filtrage)
      contacts = allUsers.filter(user => user.role === 'user');
      console.log(`Formateur ${this.currentUser.fullName} voit ${contacts.length} apprenants`);
    } 
    else if (this.currentUser.role === 'user') {
      // APPRENANT: voir TOUS les formateurs
      contacts = allUsers.filter(user => user.role === 'formateur');
      console.log(`Apprenant ${this.currentUser.fullName} voit ${contacts.length} formateurs`);
    }
    else if (this.currentUser.role === 'admin') {
      // ADMIN: voir tous les utilisateurs sauf lui-même
      contacts = allUsers.filter(u => u.id !== this.currentUser.id);
    }
    
    return contacts;
  }

  // Envoyer un message
  sendMessage(receiverId, message) {
    if (!this.currentUser) return null;
    
    const receiver = this.getAllUsers().find(u => u.id === receiverId);
    
    const messageData = {
      id: Date.now().toString(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.fullName,
      senderRole: this.currentUser.role,
      receiverId: receiverId,
      receiverName: receiver?.fullName || "Utilisateur",
      message: message,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Sauvegarder le message
    const key = `chat_${this.currentUser.id}_${receiverId}`;
    const existing = localStorage.getItem(key);
    const messages = existing ? JSON.parse(existing) : [];
    messages.push(messageData);
    localStorage.setItem(key, JSON.stringify(messages));

    // Sauvegarder aussi du côté du receveur
    const receiverKey = `chat_${receiverId}_${this.currentUser.id}`;
    const existingReceiver = localStorage.getItem(receiverKey);
    const receiverMessages = existingReceiver ? JSON.parse(existingReceiver) : [];
    receiverMessages.push(messageData);
    localStorage.setItem(receiverKey, JSON.stringify(receiverMessages));

    return messageData;
  }

  // Récupérer les messages entre deux utilisateurs
  getMessages(otherUserId) {
    if (!this.currentUser) return [];
    
    const key = `chat_${this.currentUser.id}_${otherUserId}`;
    const messages = localStorage.getItem(key);
    return messages ? JSON.parse(messages) : [];
  }

  // Marquer les messages comme lus
  markMessagesAsRead(otherUserId) {
    if (!this.currentUser) return;
    
    const key = `chat_${otherUserId}_${this.currentUser.id}`;
    const messages = localStorage.getItem(key);
    if (messages) {
      const parsedMessages = JSON.parse(messages);
      const updatedMessages = parsedMessages.map(msg => 
        msg.senderId === otherUserId && !msg.read 
          ? { ...msg, read: true } 
          : msg
      );
      localStorage.setItem(key, JSON.stringify(updatedMessages));
      
      // Mettre à jour l'autre sens
      const key2 = `chat_${this.currentUser.id}_${otherUserId}`;
      localStorage.setItem(key2, JSON.stringify(updatedMessages));
    }
  }

  // Récupérer toutes les conversations
  getAllConversations() {
    if (!this.currentUser) return [];
    
    const contacts = this.getAvailableContacts();
    const conversations = [];
    
    contacts.forEach(contact => {
      const messages = this.getMessages(contact.id);
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const unreadCount = messages.filter(m => 
        !m.read && m.senderId === contact.id
      ).length;
      
      conversations.push({
        contact,
        lastMessage,
        unreadCount,
        messages
      });
    });
    
    // Trier par date du dernier message
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });
    
    return conversations;
  }

  // Récupérer le nombre de messages non lus
  getUnreadCount() {
    const conversations = this.getAllConversations();
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }
}

export default new ChatService();