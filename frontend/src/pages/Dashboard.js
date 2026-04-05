import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, GraduationCap, BookOpen, Crown, TrendingUp, Calendar, 
  Activity, Award, UserPlus, FileText, Settings, Bell, 
  ChevronRight, Clock, CheckCircle, AlertCircle, Download, 
  RefreshCw, MoreVertical, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Dashboard = () => {
  const { currentUser, list: users, isLoading } = useSelector((state) => state.users);

  if (isLoading) return <LoadingSpinner />;

  // Data logic (identique à ton code)
  const apprenants = users.filter(u => u.role === 'user' || u.role === 'apprenant');
  const formateurs = users.filter(u => u.role === 'formateur');
  const admins = users.filter(u => u.role === 'admin');
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive !== false).length;
  const newThisMonth = users.filter(u => {
    const createdAt = new Date(u.createdAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;

  const statsCards = [
    { title: 'Total Utilisateurs', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', up: true },
    { title: 'Apprenants', value: apprenants.length, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8%', up: true },
    { title: 'Formateurs', value: formateurs.length, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+5%', up: true },
    { title: 'Administrateurs', value: admins.length, icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Stable', up: null },
  ];

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      
      {/* --- TOP HEADER / WELCOME SECTION --- */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-inner text-2xl">
              {currentUser?.avatar || '👋'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                Ravi de vous revoir, {currentUser?.prenom || 'Admin'} !
              </h1>
              <p className="text-slate-400 flex items-center mt-1 font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                AP Learning • Algérie Poste • Gestion Management
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <div className="px-4 py-2 text-center border-r border-white/10">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Date</p>
              <p className="text-sm font-semibold">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
            </div>
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Statut</p>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="group bg-white p-6 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:shadow-xl hover:ring-emerald-500/30 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-80`}>
                <stat.icon size={24} />
              </div>
              {stat.up !== null && (
                <div className={`flex items-center text-xs font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              <p className="text-slate-500 font-medium text-sm">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- MIDDLE SECTION: PERFORMANCE & ALERTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Platform Health / Progress */}
        <div className="lg:col-span-2 bg-white rounded-3xl ring-1 ring-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Santé de la plateforme</h2>
              <p className="text-slate-400 text-sm">Engagement et rétention en temps réel</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <MoreVertical size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Activité</p>
                <p className="text-2xl font-bold text-slate-800">{Math.round((activeUsers / totalUsers) * 100)}%</p>
                <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(activeUsers / totalUsers) * 100}%` }}></div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Croissance</p>
                <p className="text-2xl font-bold text-slate-800">+{newThisMonth}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1 inline-block bg-emerald-50 px-2 py-0.5 rounded-md">Ce mois-ci</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Complétion</p>
                <p className="text-2xl font-bold text-slate-800">78%</p>
                <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full rounded-full" style={{ width: `78%` }}></div>
                </div>
              </div>
            </div>

            {/* Role Distribution Bar */}
            <div className="pt-4">
              <div className="flex justify-between items-end mb-3">
                <p className="text-sm font-bold text-slate-700">Répartition des effectifs</p>
                <span className="text-xs text-slate-400 italic">Total: {totalUsers} membres</span>
              </div>
              <div className="flex h-4 w-full rounded-xl overflow-hidden shadow-inner bg-slate-100">
                <div className="bg-blue-500 transition-all" style={{ width: `${(apprenants.length / totalUsers) * 100}%` }}></div>
                <div className="bg-orange-400 transition-all" style={{ width: `${(formateurs.length / totalUsers) * 100}%` }}></div>
                <div className="bg-purple-500 transition-all" style={{ width: `${(admins.length / totalUsers) * 100}%` }}></div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></span> Apprenants
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 bg-orange-400 rounded-full shadow-sm"></span> Formateurs
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></span> Admins
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications / Alerts Sidebar */}
        <div className="bg-white rounded-3xl ring-1 ring-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Bell size={18} className="text-orange-500" />
              Centre de notifications
            </h2>
            <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">Urgent</span>
          </div>

          <div className="space-y-4 overflow-y-auto pr-1 max-h-[400px]">
            {[
              { title: "Validation requise", desc: "5 apprenants attendent approbation", icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" },
              { title: "Serveur", desc: "Maintenance prévue à 23:00", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
              { title: "Nouveau cours", desc: "Cyber-sécurité par Karim", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
            ].map((alert, i) => (
              <div key={i} className="group p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                <div className="flex gap-4">
                  <div className={`p-2 h-fit rounded-xl ${alert.bg} ${alert.color}`}>
                    <alert.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{alert.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{alert.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-auto pt-4 text-center text-xs font-bold text-emerald-600 hover:underline">
            Afficher tout le journal
          </button>
        </div>
      </div>

      {/* --- QUICK ACTIONS BAR --- */}
      <div className="bg-emerald-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-200/50">
        <div>
          <h2 className="text-xl font-bold">Actions de gestion rapide</h2>
          <p className="text-emerald-100 text-sm opacity-80">Gérez vos utilisateurs et vos rapports en un clic.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: "Ajouter Utilisateur", icon: UserPlus, link: "/users" },
            { label: "Importer Excel", icon: FileText, link: "#" },
            { label: "Extraire Rapport", icon: Download, link: "#" },
          ].map((action, i) => (
            <button 
              key={i}
              className="flex items-center gap-2 bg-white/10 hover:bg-white hover:text-emerald-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/20 shadow-sm"
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
          <button className="p-2.5 bg-slate-900 rounded-xl hover:scale-105 transition-transform shadow-lg">
            <Settings size={20} />
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;