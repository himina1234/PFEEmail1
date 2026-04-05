import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, GraduationCap, Award, 
  LogOut, ChevronRight, Clock, MapPin, 
  TrendingUp, Video, Star, Search, Bell, Menu, X,
  MessageCircle, Calendar, CheckCircle, Users,
  PlayCircle, FileText, Sparkles, Zap, Coffee
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Données des formations (Durées en nombres pour les calculs)
  const formations = [
    { 
      id: 1, 
      title: "Service Client Excellence", 
      progress: 65, 
      color: "bg-blue-500", 
      icon: "🎯",
      description: "Maîtrisez les techniques avancées du service client",
      duration: 12, // en heures
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
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <Zap className="text-green-500 animate-pulse" size={48} />
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, tab, badge }) => (
    <button
      onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        activeTab === tab 
        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          activeTab === tab ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
        }`}>{badge}</span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* --- SIDEBAR (Desktop & Mobile) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">📮</div>
            <span className="font-bold text-xl text-slate-800">AP Learning</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem icon={LayoutDashboard} label="Tableau de bord" tab="dashboard" />
          <NavItem icon={BookOpen} label="Catalogue" tab="catalogue" />
          <NavItem icon={GraduationCap} label="Mes Formations" tab="formations" />
          <NavItem icon={Award} label="Certifications" tab="certifications" />
          <NavItem icon={MessageCircle} label="Messages" tab="messages" badge="3" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                {currentUser.prenom?.[0]}
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                <p className="text-sm font-bold text-slate-800">{currentUser.prenom} {currentUser.nom}</p>
                <p className="text-xs text-slate-500">Matricule: {currentUser.matricule}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full py-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2">
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 overflow-y-auto relative h-screen">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 flex-1">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                <Menu size={20} />
              </button>
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher une formation..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Bouton Chat */}
              <button onClick={() => navigate('/chat')} className="relative p-2.5 bg-slate-100 rounded-xl hover:bg-green-100 group transition-all">
                <MessageCircle size={20} className="text-slate-600 group-hover:text-green-600" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 relative transition-all">
                  <Bell size={20} className="text-slate-600" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 ${!notif.read ? 'bg-green-50/50 border-l-4 border-green-500' : ''}`}>
                          <p className="text-sm text-slate-800 leading-tight">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><Clock size={10} /> {notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white p-8 lg:p-12 shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-green-400">
                <Sparkles size={18} />
                <span className="text-sm font-semibold tracking-wide">OBJECTIF : 42% ATTEINT</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black mb-4">Content de te revoir, <br/>{currentUser.prenom} ! 👋</h1>
              <p className="text-slate-400 max-w-md text-lg">Votre prochain module "Service Client" vous attend.</p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <button className="px-8 py-3.5 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 flex items-center gap-2">
                  <PlayCircle size={20} /> Continuer le cours
                </button>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-green-500/10 blur-[100px] rounded-full" />
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { label: "Cours Actifs", value: "04", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Temps d'étude", value: "24h", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Score Moyen", value: "88%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
              { label: "Certificats", value: "02", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </section>

          {/* Formations en cours */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <GraduationCap className="text-green-600" /> Vos formations en cours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFormations.map((course) => (
                <div key={course.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-4xl">{course.icon}</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase">{course.duration}h Total</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-green-600 transition-colors">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2">{course.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Progression</span>
                      <span className="text-green-600">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${course.color} transition-all duration-700`} 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-slate-50 text-slate-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <Video size={16} /> Reprendre
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications Section */}
          <section className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Certifications & Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className={`p-3 rounded-full ${cert.status === 'obtenu' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{cert.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{cert.date} • {cert.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default ApprenantDashboard;