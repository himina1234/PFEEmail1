// src/pages/ApprenantDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, GraduationCap, Award, 
  Clock, MapPin, TrendingUp, Video, Star, Search, Bell,
  MessageCircle, Calendar, CheckCircle, Users,
  PlayCircle, FileText, Sparkles, Zap, Coffee, X
} from 'lucide-react';

const ApprenantDashboard = () => {
  const navigate = useNavigate();
  
  // États
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nouveau cours disponible: "React pour débutants"', time: 'Il y a 2 heures', read: false },
    { id: 2, message: 'Votre certificat "JavaScript" est prêt', time: 'Hier', read: false },
    { id: 3, message: 'Rappel: Cours de demain à 10h', time: 'Il y a 1 jour', read: true }
  ]);

  // Protection de la route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Données des formations
  const formations = [
    { 
      id: 1, 
      title: "Service Client Excellence", 
      progress: 65, 
      color: "bg-blue-500", 
      icon: "🎯",
      description: "Maîtrisez les techniques avancées du service client",
      duration: 12,
      lessons: 8,
      completedLessons: 5
    },
    { 
      id: 2, 
      title: "Gestion des Colis", 
      progress: 40, 
      color: "bg-green-500", 
      icon: "📦",
      description: "Optimisez la gestion et le suivi des colis",
      duration: 8,
      lessons: 6,
      completedLessons: 2
    },
    { 
      id: 3, 
      title: "Outils Digitaux AP", 
      progress: 20, 
      color: "bg-purple-500", 
      icon: "💻",
      description: "Formation aux outils numériques de l'entreprise",
      duration: 10,
      lessons: 10,
      completedLessons: 2
    }
  ];

  const certifications = [
    { id: 1, title: "JavaScript Essentiel", date: "15/03/2024", status: "obtenu", score: "92%" },
    { id: 2, title: "HTML/CSS", date: "10/02/2024", status: "obtenu", score: "88%" },
    { id: 3, title: "React Fundamentals", date: "En cours", status: "en cours", score: "65%" }
  ];

  const filteredFormations = formations.filter(f =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0055a2] border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      {/* Header avec recherche et notifications */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#0055a2]">Tableau de bord</h1>
            <p className="text-sm text-slate-500">Bienvenue, {currentUser.prenom} {currentUser.nom}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Barre de recherche */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher une formation..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-[#0055a2]/20 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Bouton Chat */}
            <button 
              onClick={() => navigate('/chat')} 
              className="relative p-2.5 bg-slate-100 rounded-xl hover:bg-[#0055a2]/10 transition-all group"
            >
              <MessageCircle size={20} className="text-slate-600 group-hover:text-[#0055a2]" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 relative transition-all"
              >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)} 
                        className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/50 border-l-4 border-[#0055a2]' : ''}`}
                      >
                        <p className="text-sm text-slate-800 leading-tight">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                          <Clock size={10} /> {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0055a2] to-[#0077e6] text-white p-8 lg:p-10 shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-yellow-300" />
              <span className="text-sm font-semibold tracking-wide">BIENVENUE SUR AP LEARNING</span>
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold mb-3">
              Bonjour, {currentUser.prenom} ! 👋
            </h1>
            <p className="text-white/80 text-base max-w-md">
              Continuez votre apprentissage et développez vos compétences avec nos formations certifiantes.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button 
                onClick={() => navigate('/apprenant/formations')}
                className="px-6 py-2.5 bg-white text-[#0055a2] hover:bg-slate-100 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
              >
                <BookOpen size={18} />
                Découvrir les formations
              </button>
              <button className="px-6 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2">
                <PlayCircle size={18} />
                Continuer mon cours
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: "Cours Actifs", value: "03", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Temps d'étude", value: "24h", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Score Moyen", value: "88%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Certificats", value: "02", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Formations en cours */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="text-[#0055a2]" />
              Mes formations en cours
            </h2>
            <button 
              onClick={() => navigate('/apprenant/formations')}
              className="text-sm text-[#0055a2] hover:underline font-medium"
            >
              Voir toutes les formations →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((course) => (
              <div key={course.id} className="group bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">{course.icon}</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md">
                    {course.duration}h
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-[#0055a2] transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Progression</span>
                    <span className="text-[#0055a2]">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${course.color} transition-all duration-700 rounded-full`} 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                
                <button className="w-full py-2.5 bg-slate-50 text-slate-700 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#0055a2] hover:text-white transition-all">
                  <Video size={16} /> Reprendre le cours
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications Section */}
        <section className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Award className="text-[#0055a2]" />
            Mes certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className={`p-3 rounded-full ${cert.status === 'obtenu' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  <Award size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{cert.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{cert.date} • {cert.score}</p>
                  {cert.status === 'obtenu' ? (
                    <span className="inline-block mt-1 text-[10px] text-green-600 font-semibold">✓ Obtenu</span>
                  ) : (
                    <span className="inline-block mt-1 text-[10px] text-orange-600 font-semibold">⏳ En cours</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section conseils */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Zap size={24} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Conseil d'apprentissage</h3>
              <p className="text-slate-300 text-sm">
                Pour maximiser votre progression, nous vous recommandons de consacrer au moins 30 minutes par jour à vos formations.
              </p>
              <button className="mt-3 text-sm text-yellow-400 hover:text-yellow-300 font-medium">
                Voir mes objectifs →
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ApprenantDashboard;