import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../components/context/UserContext';
import { 
  User, Mail, Phone, Edit, Save, X, 
  MapPin, Shield, Camera, Clock, CheckCircle, TrendingUp,
  Calendar, Award, Activity, Settings, Bell, Lock,
  CreditCard, Globe, Facebook, Twitter, Linkedin,
  Upload, Trash2, AlertCircle, Download, RefreshCw
} from 'lucide-react';

const Profile = () => {
  const { currentUser, updateCurrentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    twoFactorAuth: false,
    language: 'fr',
    theme: 'light'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Image de secours
  const backupAvatar = "https://ui-avatars.com/api/?name=AP&background=004d3d&color=fff";

  // Empêcher le scroll quand une modale est ouverte
  useEffect(() => {
    if (isModalOpen || isPasswordModalOpen || isSettingsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Fermer la modale en cliquant à l'extérieur
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (isModalOpen) setIsModalOpen(false);
        if (isPasswordModalOpen) setIsPasswordModalOpen(false);
        if (isSettingsModalOpen) setIsSettingsModalOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen, isPasswordModalOpen, isSettingsModalOpen]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d3d] mx-auto mb-4"></div>
          <p className="text-[#004d3d] font-bold">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("L'image ne doit pas dépasser 5 Mo");
        return;
      }
      
      setIsUploading(true);
      setUploadProgress(0);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Simuler le progrès
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              updateCurrentUser({ ...currentUser, avatar: canvas.toDataURL('image/jpeg', 0.6) });
              setIsUploading(false);
              showSuccessToast("Photo de profil mise à jour !");
            }
          }, 50);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) {
      updateCurrentUser({ ...currentUser, avatar: null });
      showSuccessToast("Photo de profil supprimée");
    }
  };

  const showSuccessToast = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const showErrorToast = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  const handleUpdateProfile = () => {
    if (!editedUser.email?.includes('@')) {
      showErrorToast("Email invalide");
      return;
    }
    
    updateCurrentUser({ ...currentUser, ...editedUser });
    setIsModalOpen(false);
    showSuccessToast("Profil mis à jour avec succès !");
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorToast("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showErrorToast("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    // Simulation de changement de mot de passe
    showSuccessToast("Mot de passe modifié avec succès !");
    setIsPasswordModalOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleUpdateSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    showSuccessToast("Paramètres sauvegardés !");
    setIsSettingsModalOpen(false);
  };

  const handleExportData = () => {
    const data = {
      user: currentUser,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `profile_export_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccessToast("Données exportées avec succès !");
  };

  // Calculer le temps depuis la création du compte
  const getAccountAge = () => {
    const createdDate = new Date(currentUser.createdAt || '2024-01-01');
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      
      {/* Notifications Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[10000] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}
      
      {showError && (
        <div className="fixed top-4 right-4 z-[10000] bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {/* CONTENEUR PRINCIPAL */}
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* BANNIÈRE PROFIL */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#004d3d] to-[#006b54] rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-white border border-white/10">
          {/* Décoration d'arrière-plan */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

          <div className="relative z-20 flex flex-col md:flex-row items-center gap-10">
            
            {/* PHOTO DE PROFIL */}
            <div className="relative flex-shrink-0 group">
              <div 
                className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-xl bg-[#002b22] cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <img 
                  src={currentUser.avatar || backupAvatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  onError={(e) => { e.target.src = backupAvatar; }}
                />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 rounded-[2rem] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <span className="text-xs">{uploadProgress}%</span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-[2rem] cursor-pointer"
                   onClick={() => fileInputRef.current.click()}>
                <Camera className="text-white w-8 h-8" />
              </div>
              {currentUser.avatar && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Supprimer la photo"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>

            {/* INFOS NOM/ROLE */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-2">
                {currentUser.prenom} {currentUser.nom}
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500 text-[#004d3d] rounded-xl text-[10px] font-black uppercase tracking-widest mb-4">
                <Shield size={12} />
                {currentUser.role || 'Personnel'}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-green-50/80 text-sm">
                <span className="flex items-center gap-2"><MapPin size={14} /> Alger Centre, DZ</span>
                <span className="flex items-center gap-2"><Clock size={14} /> Membre depuis {getAccountAge()} jours</span>
                <span className="flex items-center gap-2"><Award size={14} /> Niveau 3</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setEditedUser(currentUser); setIsModalOpen(true); }}
                className="px-6 py-3 bg-white text-[#004d3d] rounded-xl font-bold hover:bg-yellow-500 hover:text-[#004d3d] transition-all shadow-lg flex items-center gap-2 text-sm"
              >
                <Edit size={16} /> Modifier
              </button>
              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2 text-sm backdrop-blur-sm"
              >
                <Settings size={16} /> Paramètres
              </button>
            </div>
          </div>
        </div>

        {/* STATS CARTES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Activity className="text-[#004d3d]" size={24} />
              </div>
              <span className="text-2xl font-black text-[#004d3d]">94%</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Score d'activité</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#004d3d] rounded-full h-2" style={{ width: '94%' }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <span className="text-2xl font-black text-blue-600">127</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Demandes traitées</p>
            <p className="text-xs text-gray-400 mt-2">Ce mois: +12</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Award className="text-purple-600" size={24} />
              </div>
              <span className="text-2xl font-black text-purple-600">4.8</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Note moyenne</p>
            <div className="flex items-center gap-1 mt-2">
              {[1,2,3,4,5].map(star => (
                <Star key={star} className="fill-current text-yellow-500" size={14} />
              ))}
            </div>
          </div>
        </div>

        {/* GRILLE INFO PRINCIPALE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
              <User size={20} className="text-[#004d3d]" /> 
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase ml-2">Nom complet</p>
                <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-700">
                  {currentUser.prenom} {currentUser.nom}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase ml-2">Email professionnel</p>
                <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {currentUser.email}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase ml-2">Téléphone</p>
                <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-700 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  {currentUser.telephone || '+213 XX XX XX XX'}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase ml-2">Département</p>
                <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-700">
                  Services Administratifs
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-sm text-[#004d3d] font-medium hover:text-yellow-600 transition-colors flex items-center gap-2"
              >
                <Lock size={14} />
                Changer le mot de passe
              </button>
            </div>
          </div>

          {/* Carte d'activité */}
          <div className="bg-gradient-to-br from-[#004d3d] to-[#006b54] rounded-[2rem] p-8 text-white shadow-lg">
            <div className="text-center mb-6">
              <Activity className="mx-auto mb-3 text-yellow-500" size={32} />
              <h4 className="text-xl font-black">Statut actif</h4>
              <p className="text-green-200 text-sm mt-1">Connecté depuis aujourd'hui</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-80">Dernière connexion</span>
                <span className="font-bold">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-80">Appareil</span>
                <span className="font-bold">Windows 10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-80">IP</span>
                <span className="font-mono text-xs">192.168.1.1</span>
              </div>
            </div>
            
            <button
              onClick={handleExportData}
              className="mt-6 w-full py-3 bg-white/10 rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Exporter mes données
            </button>
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
            <Shield size={20} className="text-[#004d3d]" />
            Sécurité du compte
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Lock size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Authentification 2FA</p>
                <p className="text-xs text-gray-500">Protection renforcée</p>
              </div>
              <button className="ml-auto text-sm text-[#004d3d] font-medium">Activer</button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Notifications</p>
                <p className="text-xs text-gray-500">Alertes de sécurité</p>
              </div>
              <button className="ml-auto text-sm text-[#004d3d] font-medium">Configurer</button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Sessions actives</p>
                <p className="text-xs text-gray-500">1 session en cours</p>
              </div>
              <button className="ml-auto text-sm text-[#004d3d] font-medium">Voir</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE ÉDITION PROFIL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div ref={modalRef} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-[#004d3d] to-[#006b54] p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-black tracking-wider text-lg">MODIFIER LE PROFIL</h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Prénom</label>
                <input 
                  type="text" 
                  value={editedUser.prenom || currentUser.prenom || ''} 
                  onChange={(e) => setEditedUser({...editedUser, prenom: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#004d3d] outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Nom</label>
                <input 
                  type="text" 
                  value={editedUser.nom || currentUser.nom || ''} 
                  onChange={(e) => setEditedUser({...editedUser, nom: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#004d3d] outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Email</label>
                <input 
                  type="email" 
                  value={editedUser.email || currentUser.email || ''} 
                  onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#004d3d] outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Téléphone</label>
                <input 
                  type="tel" 
                  value={editedUser.telephone || currentUser.telephone || ''} 
                  onChange={(e) => setEditedUser({...editedUser, telephone: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#004d3d] outline-none font-medium"
                  placeholder="+213 5XX XX XX XX"
                />
              </div>
              <button 
                onClick={handleUpdateProfile}
                className="w-full py-3 bg-gradient-to-r from-[#004d3d] to-[#006b54] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                ENREGISTRER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CHANGEMENT MOT DE PASSE */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div ref={modalRef} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-[#004d3d] to-[#006b54] p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-black tracking-wider text-lg">CHANGER LE MOT DE PASSE</h3>
                <button onClick={() => setIsPasswordModalOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Mot de passe actuel</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#004d3d] outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#004d3d] outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#004d3d] outline-none font-medium"
                />
              </div>
              <button 
                onClick={handlePasswordChange}
                className="w-full py-3 bg-gradient-to-r from-[#004d3d] to-[#006b54] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                CHANGER LE MOT DE PASSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE PARAMÈTRES */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div ref={modalRef} className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-[#004d3d] to-[#006b54] p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-black tracking-wider text-lg">PARAMÈTRES</h3>
                <button onClick={() => setIsSettingsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">Notifications</p>
                  <p className="text-xs text-gray-500">Recevoir des alertes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004d3d]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">Alertes email</p>
                  <p className="text-xs text-gray-500">Notifications par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.emailAlerts}
                    onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004d3d]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">Double authentification</p>
                  <p className="text-xs text-gray-500">Sécurité renforcée</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.twoFactorAuth}
                    onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004d3d]"></div>
                </label>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Langue</label>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#004d3d] outline-none"
                >
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
              <button 
                onClick={handleUpdateSettings}
                className="w-full py-3 bg-gradient-to-r from-[#004d3d] to-[#006b54] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                SAUVEGARDER
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Composant Star manquant
const Star = ({ className, size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

export default Profile;