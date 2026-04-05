import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Star, Plus, Edit3, 
  LogOut, Bell, Search, Zap, ChevronRight,
  TrendingUp, Award, MoreHorizontal, Calendar,
  MessageCircle, Settings, HelpCircle, Download,
  BarChart2, CheckCircle, Clock, PlayCircle,
  FileText, Video, Headphones, Coffee, Sparkles
} from 'lucide-react';

const FormateurDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('cours');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nouveau cours ajouté avec succès', time: 'Il y a 5 min', read: false, type: 'success' },
    { id: 2, message: '5 nouveaux apprenants inscrits', time: 'Il y a 2 heures', read: false, type: 'info' },
    { id: 3, message: 'Votre cours "React" a été approuvé', time: 'Hier', read: true, type: 'success' }
  ]);
  
  const navigate = useNavigate(); // Déclaration unique de navigate

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(savedUser));
  }, [navigate]);

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

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-yellow-500 animate-pulse" size={24} />
          </div>
        </div>
      </div>
    );
  }

  // Données des cours
  const courses = [
    {
      id: 1,
      title: 'React Avancé',
      description: 'Maîtrisez les concepts avancés de React',
      students: 24,
      category: 'Développement Web',
      progress: 75,
      lessons: 12,
      completedLessons: 9,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      rating: 4.8,
      status: 'active',
      nextLesson: 'Hooks personnalisés'
    },
    {
      id: 2,
      title: 'JavaScript Moderne',
      description: 'ES6+ et concepts modernes',
      students: 18,
      category: 'JavaScript',
      progress: 42,
      lessons: 8,
      completedLessons: 3,
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop',
      rating: 4.6,
      status: 'active',
      nextLesson: 'Async/Await'
    },
    {
      id: 3,
      title: 'Node.js & Express',
      description: 'APIs RESTful avec Node.js',
      students: 12,
      category: 'Backend',
      progress: 30,
      lessons: 10,
      completedLessons: 3,
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
      rating: 4.9,
      status: 'draft',
      nextLesson: 'Mise en place'
    }
  ];

  const stats = [
    { label: 'Cours créés', value: courses.length, icon: BookOpen, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Total apprenants', value: courses.reduce((acc, c) => acc + c.students, 0), icon: Users, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Note moyenne', value: '4.8', icon: Star, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { label: 'Taux d\'achèvement', value: '68%', icon: TrendingUp, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' }
  ];

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12} /> Actif</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12} /> Brouillon</span>;
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sidebar Moderne */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#004d3d] to-[#006b54] rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="text-yellow-500" size={20} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AP Formateur</h1>
                <p className="text-xs text-gray-500">Plateforme de formation</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <NavItem icon={BookOpen} label="Mes cours" active={activeTab === 'cours'} onClick={() => setActiveTab('cours')} />
            <NavItem icon={Users} label="Mes apprenants" onClick={() => setActiveTab('apprenants')} />
            <NavItem icon={BarChart2} label="Statistiques" onClick={() => setActiveTab('stats')} />
            <NavItem icon={MessageCircle} label="Messages" badge="3" onClick={() => setActiveTab('messages')} />
            <NavItem icon={Settings} label="Paramètres" onClick={() => setActiveTab('settings')} />
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.prenom?.[0]}{currentUser.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.prenom} {currentUser.nom}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.matricule}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2 bg-white/80 hover:bg-white rounded-lg text-xs font-medium text-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de bord</h1>
              <p className="text-gray-500">Bienvenue, {currentUser.prenom} ! Voici l'aperçu de votre activité</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004d3d] w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                          <p className="text-sm text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton Chat */}
              <button
                onClick={handleChatClick}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                {/* Badge de messages non lus */}
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profil */}
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{currentUser.prenom} {currentUser.nom}</p>
                  <p className="text-xs text-gray-500">{currentUser.role === 'formateur' ? 'Formateur' : 'Administrateur'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#004d3d] to-[#006b54] rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.prenom?.[0]}{currentUser.nom?.[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className={stat.textColor} size={24} />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full`} style={{ width: '70%' }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-[#004d3d] to-[#006b54] rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Créez un nouveau cours</h3>
                <p className="text-green-100 text-sm">Partagez vos connaissances avec vos apprenants</p>
              </div>
              <button className="px-6 py-3 bg-white text-[#004d3d] rounded-xl font-medium hover:bg-yellow-500 hover:text-[#004d3d] transition-all flex items-center gap-2">
                <Plus size={18} />
                Créer un cours
              </button>
            </div>
          </div>

          {/* Mes Cours */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-[#004d3d]" />
                  Mes cours
                </h2>
                <button className="text-sm text-[#004d3d] hover:text-yellow-600 transition-colors flex items-center gap-1">
                  Voir tout <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCourses.map(course => (
                  <div key={course.id} className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(course.status)}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.description}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star size={14} className="fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-700">{course.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {course.students} apprenants
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={14} /> {course.lessons} leçons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {course.completedLessons}/{course.lessons}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-medium text-[#004d3d]">{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#004d3d] to-yellow-500 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="flex-1 py-2 bg-[#004d3d] text-white rounded-lg font-medium text-sm hover:bg-[#006b54] transition-colors flex items-center justify-center gap-2">
                          <Edit3 size={16} />
                          Modifier
                        </button>
                        <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-yellow-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                          <PlayCircle size={16} />
                          Continuer
                        </button>
                      </div>
                      
                      {course.nextLesson && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <Sparkles size={12} className="text-yellow-500" />
                            Prochaine leçon: {course.nextLesson}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Aucun cours trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Activité récente et recommandations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Activité récente */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#004d3d]" />
                Activité récente
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Nouvel apprenant inscrit</p>
                      <p className="text-xs text-gray-500">Ahmed Benali a rejoint le cours "React Avancé"</p>
                    </div>
                    <span className="text-xs text-gray-400">Il y a 2 heures</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" />
                Conseils du jour
              </h3>
              <div className="space-y-4">
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-sm text-gray-700">🎯 Interagissez avec vos apprenants pour améliorer l'engagement</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-sm text-gray-700">📊 Utilisez les statistiques pour suivre la progression</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3">
                  <p className="text-sm text-gray-700">✨ Mettez à jour vos cours régulièrement</p>
                </div>
              </div>
              <button className="mt-4 w-full py-2 bg-white rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors">
                Voir tous les conseils
              </button>
            </div>
          </div>
        </header>
      </main>
    </div>
  );
};

// Composant NavItem
const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
      active 
        ? 'bg-gradient-to-r from-[#004d3d] to-[#006b54] text-white shadow-lg' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={active ? 'text-white' : 'text-gray-500'} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge && (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

export default FormateurDashboard;