// Statistiques.js
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, BookOpen, DollarSign, Calendar,
  Download, Filter, RefreshCw, ArrowUp, ArrowDown,
  UserCheck, UserX, Award, Clock, Eye, Star,
  BarChart2, PieChart, Activity, Zap, Target,
  ChevronRight, ChevronLeft, MoreVertical
} from 'lucide-react';

const Statistiques = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: { total: 0, actifs: 0, inactifs: 0, nouveaux: 0, evolution: '+12%' },
    formations: { total: 0, actives: 0, enCours: 0, terminees: 0, evolution: '+8%' },
    inscriptions: { total: 0, ceMois: 0, evolution: '+23%' },
    revenus: { total: 0, ceMois: 0, evolution: '+15%' },
    tauxReussite: { value: 78, evolution: '+5%' },
    satisfaction: { value: 4.6, evolution: '+0.3' }
  });

  const [chartData, setChartData] = useState({
    inscriptions: [45, 52, 48, 61, 58, 67, 72, 85, 78, 82, 91, 98],
    revenus: [12500, 14800, 13200, 15600, 16800, 18200, 19500, 21000, 22800, 24500, 26800, 28500],
    formations: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  });

  const [topFormations, setTopFormations] = useState([
    { id: 1, nom: 'JavaScript Avancé', inscrits: 45, progression: 85, note: 4.8 },
    { id: 2, nom: 'Administration Postale', inscrits: 38, progression: 72, note: 4.6 },
    { id: 3, nom: 'Communication Pro', inscrits: 32, progression: 68, note: 4.5 },
    { id: 4, nom: 'React Development', inscrits: 28, progression: 45, note: 4.9 },
    { id: 5, nom: 'Gestion de Projet', inscrits: 25, progression: 60, note: 4.7 }
  ]);

  const [activiteRecente, setActiviteRecente] = useState([
    { id: 1, action: 'Nouvel utilisateur inscrit', user: 'Ahmed Benali', date: '2026-03-30 14:30', type: 'user' },
    { id: 2, action: 'Formation ajoutée', user: 'Admin', date: '2026-03-30 10:15', type: 'formation' },
    { id: 3, action: 'Certificat délivré', user: 'Fatima Zohra', date: '2026-03-29 16:45', type: 'certificat' },
    { id: 4, action: 'Nouvelle inscription', user: 'Karim Benali', date: '2026-03-29 09:20', type: 'inscription' }
  ]);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = () => {
    setLoading(true);
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    const data = {
      stats,
      chartData,
      topFormations,
      activiteRecente,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `statistiques_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getEvolutionColor = (evolution) => {
    if (evolution.includes('+')) return 'text-green-600';
    if (evolution.includes('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getEvolutionIcon = (evolution) => {
    if (evolution.includes('+')) return <ArrowUp size={14} className="text-green-600" />;
    if (evolution.includes('-')) return <ArrowDown size={14} className="text-red-600" />;
    return null;
  };

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <BarChart2 size={32} className="text-blue-600" />
                Tableau de bord analytique
              </h1>
              <p className="text-gray-500">Visualisez les performances de votre plateforme</p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === 'week' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === 'month' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setPeriod('year')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === 'year' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Année
                </button>
              </div>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Download size={18} />
                Exporter
              </button>
              <button
                onClick={loadStats}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${getEvolutionColor(stats.users.evolution)}`}>
                {getEvolutionIcon(stats.users.evolution)}
                <span>{stats.users.evolution}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.users.total || 156}</h3>
            <p className="text-gray-500 text-sm mt-1">Utilisateurs totaux</p>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="text-green-600">✓ {stats.users.actifs || 142} actifs</span>
              <span className="text-gray-400">+{stats.users.nouveaux || 12} nouveaux</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <BookOpen className="text-green-600" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${getEvolutionColor(stats.formations.evolution)}`}>
                {getEvolutionIcon(stats.formations.evolution)}
                <span>{stats.formations.evolution}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.formations.total || 24}</h3>
            <p className="text-gray-500 text-sm mt-1">Formations disponibles</p>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="text-green-600">{stats.formations.actives || 18} actives</span>
              <span className="text-yellow-600">{stats.formations.enCours || 6} en cours</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <UserCheck className="text-orange-600" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${getEvolutionColor(stats.inscriptions.evolution)}`}>
                {getEvolutionIcon(stats.inscriptions.evolution)}
                <span>{stats.inscriptions.evolution}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.inscriptions.total || 1248}</h3>
            <p className="text-gray-500 text-sm mt-1">Inscriptions totales</p>
            <div className="mt-3 text-xs text-gray-500">
              +{stats.inscriptions.ceMois || 156} ce mois
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="text-purple-600" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${getEvolutionColor(stats.revenus.evolution)}`}>
                {getEvolutionIcon(stats.revenus.evolution)}
                <span>{stats.revenus.evolution}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.revenus.total?.toLocaleString() || '0'} DZD</h3>
            <p className="text-gray-500 text-sm mt-1">Revenus totaux</p>
            <div className="mt-3 text-xs text-gray-500">
              {stats.revenus.ceMois?.toLocaleString() || '0'} DZD ce mois
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique des inscriptions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Évolution des inscriptions
              </h3>
              <select className="text-sm border rounded-lg px-3 py-1">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {chartData.inscriptions.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                      style={{ height: `${(value / 120) * 200}px`, maxHeight: '200px' }}
                    >
                      <div className="opacity-0 hover:opacity-100 absolute -mt-8 bg-gray-800 text-white text-xs rounded px-2 py-1">
                        {value} inscrits
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{months[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Graphique des revenus */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Évolution des revenus
              </h3>
              <span className="text-sm text-gray-500">en milliers DZD</span>
            </div>
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {chartData.revenus.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500 cursor-pointer"
                      style={{ height: `${(value / 30000) * 200}px`, maxHeight: '200px' }}
                    >
                      <div className="opacity-0 hover:opacity-100 absolute -mt-8 bg-gray-800 text-white text-xs rounded px-2 py-1">
                        {value.toLocaleString()} DZD
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{months[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Deuxième ligne de graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Taux de réussite */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-600" />
              Taux de réussite
            </h3>
            <div className="relative flex justify-center mb-4">
              <div className="w-40 h-40 rounded-full border-8 border-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-purple-600">{stats.tauxReussite.value || 78}%</span>
                  <p className="text-xs text-gray-500">de réussite</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Objectif 2026</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 rounded-full h-2" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>

          {/* Satisfaction */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star size={20} className="text-yellow-500" />
              Satisfaction apprenants
            </h3>
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`${i < Math.floor(stats.satisfaction.value || 4.6) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} size={32} />
                  ))}
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.satisfaction.value || 4.6}/5</span>
                <p className="text-xs text-gray-500 mt-1">basé sur 245 avis</p>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>⭐⭐⭐⭐⭐ 68%</span>
              <span>⭐⭐⭐⭐ 22%</span>
              <span>⭐⭐⭐ 7%</span>
            </div>
          </div>

          {/* Répartition des rôles */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-indigo-600" />
              Répartition des utilisateurs
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Apprenants</span>
                  <span className="font-medium">{stats.users.total ? Math.round(stats.users.total * 0.7) : 109}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 rounded-full h-2" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Formateurs</span>
                  <span className="font-medium">{stats.users.total ? Math.round(stats.users.total * 0.2) : 31}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 rounded-full h-2" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Administrateurs</span>
                  <span className="font-medium">{stats.users.total ? Math.round(stats.users.total * 0.1) : 16}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 rounded-full h-2" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top formations et activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top formations */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Award size={20} className="text-yellow-500" />
                Top 5 des formations
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {topFormations.map((formation, index) => (
                <div key={formation.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{formation.nom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={14} className="fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">{formation.note}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{formation.inscrits} inscrits</span>
                    <span>Progression {formation.progression}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 rounded-full h-1.5"
                      style={{ width: `${formation.progression}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Activity size={20} className="text-green-600" />
                Activité récente
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {activiteRecente.map((activite) => (
                <div key={activite.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activite.type === 'user' ? 'bg-blue-100' :
                      activite.type === 'formation' ? 'bg-green-100' :
                      activite.type === 'certificat' ? 'bg-yellow-100' : 'bg-purple-100'
                    }`}>
                      {activite.type === 'user' && <Users size={16} className="text-blue-600" />}
                      {activite.type === 'formation' && <BookOpen size={16} className="text-green-600" />}
                      {activite.type === 'certificat' && <Award size={16} className="text-yellow-600" />}
                      {activite.type === 'inscription' && <UserCheck size={16} className="text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activite.action}</p>
                      <p className="text-xs text-gray-500">par {activite.user}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(activite.date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1">
                Voir toutes les activités
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-xl">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Chargement des données...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistiques;