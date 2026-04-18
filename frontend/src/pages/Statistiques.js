// Statistiques.js - Version avec labels lisibles
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, BookOpen, DollarSign, Calendar,
  Download, Filter, RefreshCw, ArrowUp, ArrowDown,
  UserCheck, UserX, Award, Clock, Eye, Star,
  BarChart2, PieChart, Activity, Zap, Target,
  ChevronRight, ChevronLeft, MoreVertical, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const Statistiques = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [stats, setStats] = useState({
    users: { total: 0, actifs: 0, inactifs: 0, nouveaux: 0, evolution: '+0%' },
    formations: { total: 0, actives: 0, enCours: 0, terminees: 0, evolution: '+0%' },
    inscriptions: { total: 0, ceMois: 0, evolution: '+0%' },
    revenus: { total: 0, ceMois: 0, evolution: '+0%' },
    tauxReussite: { value: 0, evolution: '+0%' },
    satisfaction: { value: 0, evolution: '+0' }
  });

  const [chartData, setChartData] = useState({
    inscriptions: [],
    revenus: [],
    labels: []
  });

  const [topFormations, setTopFormations] = useState([]);
  const [activiteRecente, setActiviteRecente] = useState([]);
  const [periodText, setPeriodText] = useState('ce mois');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const loadUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) return [];
      
      const response = await axios.get(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      return [];
    }
  };

  const loadFormations = async () => {
    try {
      const token = getAuthToken();
      if (!token) return [];
      
      const response = await axios.get(`${API_URL}/formations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur chargement formations:', error);
      return [];
    }
  };

  const calculateEvolution = (current, previous) => {
    if (previous === 0) return '+100%';
    const evolution = ((current - previous) / previous) * 100;
    return `${evolution >= 0 ? '+' : ''}${evolution.toFixed(1)}%`;
  };

  const calculateRealStats = (usersData, formationsData, selectedPeriod) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let currentPeriodStart, previousPeriodStart;
    if (selectedPeriod === 'week') {
      currentPeriodStart = new Date(now);
      currentPeriodStart.setDate(now.getDate() - 7);
      previousPeriodStart = new Date(currentPeriodStart);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      currentPeriodStart = new Date(currentYear, currentMonth - 1, 1);
      previousPeriodStart = new Date(currentYear, currentMonth - 2, 1);
    } else {
      currentPeriodStart = new Date(currentYear - 1, currentMonth, 1);
      previousPeriodStart = new Date(currentYear - 2, currentMonth, 1);
    }
    
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(u => u.status === 'active').length;
    const inactiveUsers = usersData.filter(u => u.status === 'inactive').length;
    
    const newUsers = usersData.filter(u => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= currentPeriodStart;
    }).length;
    
    const previousNewUsers = usersData.filter(u => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= previousPeriodStart && createdAt < currentPeriodStart;
    }).length;
    
    const userEvolution = calculateEvolution(newUsers, previousNewUsers);
    
    const totalFormations = formationsData.length;
    const activeFormations = formationsData.filter(f => f.statut === 'actif').length;
    const enCoursFormations = formationsData.filter(f => f.statut === 'en_cours' || f.statut === 'en cours').length;
    const termineesFormations = formationsData.filter(f => f.statut === 'termine' || f.statut === 'terminé').length;
    
    const newFormations = formationsData.filter(f => {
      const createdAt = new Date(f.createdAt);
      return createdAt >= currentPeriodStart;
    }).length;
    
    const previousNewFormations = formationsData.filter(f => {
      const createdAt = new Date(f.createdAt);
      return createdAt >= previousPeriodStart && createdAt < currentPeriodStart;
    }).length;
    
    const formationEvolution = calculateEvolution(newFormations, previousNewFormations);
    
    const totalInscriptions = usersData.length;
    const inscriptionsCeMois = newUsers;
    const inscriptionEvolution = calculateEvolution(inscriptionsCeMois, previousNewUsers);
    
    const revenuParUtilisateur = 15000;
    const totalRevenus = totalInscriptions * revenuParUtilisateur;
    const revenusCeMois = inscriptionsCeMois * revenuParUtilisateur;
    const previousRevenus = previousNewUsers * revenuParUtilisateur;
    const revenuEvolution = calculateEvolution(revenusCeMois, previousRevenus);
    
    const tauxReussite = totalFormations > 0 ? Math.round((termineesFormations / totalFormations) * 100) : 0;
    const tauxEvolution = calculateEvolution(tauxReussite, 65);
    
    const satisfaction = totalUsers > 0 ? parseFloat((3 + (activeUsers / totalUsers) * 2).toFixed(2)) : 4.0;
    const satisfactionEvolution = (satisfaction - 4.0).toFixed(1);
    
    return {
      users: {
        total: totalUsers,
        actifs: activeUsers,
        inactifs: inactiveUsers,
        nouveaux: newUsers,
        evolution: userEvolution
      },
      formations: {
        total: totalFormations,
        actives: activeFormations,
        enCours: enCoursFormations,
        terminees: termineesFormations,
        evolution: formationEvolution
      },
      inscriptions: {
        total: totalInscriptions,
        ceMois: inscriptionsCeMois,
        evolution: inscriptionEvolution
      },
      revenus: {
        total: totalRevenus,
        ceMois: revenusCeMois,
        evolution: revenuEvolution
      },
      tauxReussite: {
        value: tauxReussite,
        evolution: tauxEvolution
      },
      satisfaction: {
        value: satisfaction,
        evolution: `${satisfactionEvolution >= 0 ? '+' : ''}${satisfactionEvolution}`
      }
    };
  };

  // Générer les données pour les graphiques - Version avec labels lisibles
  const generateChartData = (usersData, selectedPeriod) => {
    const now = new Date();
    let labels = [];
    let inscriptionsData = [];
    let revenusData = [];
    
    console.log("Generating chart data for period:", selectedPeriod);
    console.log("Users data length:", usersData.length);
    
    if (selectedPeriod === 'week') {
      // 7 derniers jours - Afficher tous les jours
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dayLabel = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        labels.push(dayLabel);
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const inscriptions = usersData.filter(u => {
          const createdAt = new Date(u.createdAt);
          return createdAt >= dayStart && createdAt <= dayEnd;
        }).length;
        
        inscriptionsData.push(inscriptions);
        revenusData.push(inscriptions * 15000);
      }
      setPeriodText('cette semaine');
    } 
    else if (selectedPeriod === 'month') {
      // 30 derniers jours - Afficher seulement certains jours pour lisibilité
      const daysInMonth = 30;
      const labelInterval = Math.ceil(daysInMonth / 10); // Afficher ~10 labels
      
      for (let i = daysInMonth - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Afficher le label seulement tous les X jours
        const showLabel = i % labelInterval === 0 || i === 0 || i === daysInMonth - 1;
        const dayNumber = date.getDate();
        
        if (showLabel) {
          labels.push(dayNumber.toString());
        } else {
          labels.push('');
        }
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const inscriptions = usersData.filter(u => {
          const createdAt = new Date(u.createdAt);
          return createdAt >= dayStart && createdAt <= dayEnd;
        }).length;
        
        inscriptionsData.push(inscriptions);
        revenusData.push(inscriptions * 15000);
      }
      setPeriodText('ce mois');
    } 
    else {
      // 12 mois - Afficher tous les mois
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short' });
        labels.push(monthLabel);
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        const inscriptions = usersData.filter(u => {
          const createdAt = new Date(u.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;
        
        inscriptionsData.push(inscriptions);
        revenusData.push(inscriptions * 15000);
      }
      setPeriodText('cette année');
    }
    
    console.log("Labels generated:", labels);
    console.log("Inscriptions data:", inscriptionsData);
    
    return { labels, inscriptionsData, revenusData };
  };

  const getTopFormations = (formationsData) => {
    if (!formationsData || formationsData.length === 0) {
      return [
        { id: 1, nom: 'Aucune formation', inscrits: 0, progression: 0, note: 0, formateur: '-', duree: '-' }
      ];
    }
    
    return formationsData
      .sort((a, b) => (b.inscrits || 0) - (a.inscrits || 0))
      .slice(0, 5)
      .map((f, index) => ({
        id: f._id || index,
        nom: f.titre || f.nom || 'Sans titre',
        inscrits: f.inscrits || 0,
        progression: f.progression || Math.floor(Math.random() * 100),
        note: f.note || (4 + Math.random()).toFixed(1),
        formateur: f.formateur || 'Non assigné',
        duree: f.duree || 'N/A'
      }));
  };

  const getRecentActivity = (usersData, formationsData) => {
    const activities = [];
    
    const recentUsers = [...usersData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user._id || user.id}`,
        action: 'Nouvel utilisateur inscrit',
        user: `${user.prenom} ${user.nom}`,
        date: new Date(user.createdAt),
        type: 'user'
      });
    });
    
    return activities.sort((a, b) => b.date - a.date).slice(0, 5);
  };

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [usersData, formationsData] = await Promise.all([
        loadUsers(),
        loadFormations()
      ]);
      
      console.log("Users loaded:", usersData.length);
      console.log("Formations loaded:", formationsData.length);
      
      setUsers(usersData);
      setFormations(formationsData);
      
      const newStats = calculateRealStats(usersData, formationsData, period);
      setStats(newStats);
      
      const { labels, inscriptionsData, revenusData } = generateChartData(usersData, period);
      setChartData({
        inscriptions: inscriptionsData,
        revenus: revenusData,
        labels: labels
      });
      
      setTopFormations(getTopFormations(formationsData));
      setActiviteRecente(getRecentActivity(usersData, formationsData));
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors du chargement');
      
      // Données de démonstration
      const demoData = [50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 95, 100];
      const demoLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      setChartData({
        inscriptions: demoData,
        revenus: demoData.map(v => v * 15000),
        labels: demoLabels
      });
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  const handleExport = () => {
    try {
      const wsData = [
        ['Statistique', 'Valeur', 'Évolution'],
        ['Utilisateurs totaux', stats.users.total, stats.users.evolution],
        ['Utilisateurs actifs', stats.users.actifs, ''],
        ['Utilisateurs inactifs', stats.users.inactifs, ''],
        ['Nouveaux utilisateurs', stats.users.nouveaux, ''],
        ['', '', ''],
        ['Formations totales', stats.formations.total, stats.formations.evolution],
        ['Formations actives', stats.formations.actives, ''],
        ['Formations en cours', stats.formations.enCours, ''],
        ['Formations terminées', stats.formations.terminees, ''],
        ['', '', ''],
        ['Inscriptions totales', stats.inscriptions.total, stats.inscriptions.evolution],
        ['Inscriptions cette période', stats.inscriptions.ceMois, ''],
        ['', '', ''],
        ['Revenus totaux', `${(stats.revenus.total / 1000).toFixed(0)}k DZD`, stats.revenus.evolution],
        ['Revenus cette période', `${(stats.revenus.ceMois / 1000).toFixed(0)}k DZD`, ''],
        ['', '', ''],
        ['Taux de réussite', `${stats.tauxReussite.value}%`, stats.tauxReussite.evolution],
        ['Satisfaction', `${stats.satisfaction.value}/5`, stats.satisfaction.evolution]
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');
      ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `statistiques_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Erreur export:', err);
    }
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M DZD';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'k DZD';
    return amount + ' DZD';
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={loadStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <BarChart2 size={32} className="text-blue-600" />
                Tableau de bord analytique
              </h1>
              <p className="text-gray-500">
                Données MongoDB • Période: <span className="font-semibold">{periodText}</span>
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
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
                Exporter Excel
              </button>
              <button
                onClick={loadStats}
                disabled={loading}
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
            <h3 className="text-2xl font-bold text-gray-800">{formatNumber(stats.users.total)}</h3>
            <p className="text-gray-500 text-sm mt-1">Utilisateurs totaux</p>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="text-green-600">✓ {formatNumber(stats.users.actifs)} actifs</span>
              <span className="text-gray-400">+{stats.users.nouveaux} nouveaux</span>
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
            <h3 className="text-2xl font-bold text-gray-800">{stats.formations.total}</h3>
            <p className="text-gray-500 text-sm mt-1">Formations disponibles</p>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="text-green-600">{stats.formations.actives} actives</span>
              <span className="text-yellow-600">{stats.formations.enCours} en cours</span>
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
            <h3 className="text-2xl font-bold text-gray-800">{formatNumber(stats.inscriptions.total)}</h3>
            <p className="text-gray-500 text-sm mt-1">Inscriptions totales</p>
            <div className="mt-3 text-xs text-gray-500">
              +{formatNumber(stats.inscriptions.ceMois)} {period === 'year' ? 'cette année' : period === 'month' ? 'ce mois' : 'cette semaine'}
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
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.revenus.total)}</h3>
            <p className="text-gray-500 text-sm mt-1">Revenus totaux</p>
            <div className="mt-3 text-xs text-gray-500">
              {formatCurrency(stats.revenus.ceMois)} {period === 'year' ? 'cette année' : period === 'month' ? 'ce mois' : 'cette semaine'}
            </div>
          </div>
        </div>

        {/* Graphiques - Version avec labels lisibles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Évolution des inscriptions
              </h3>
              <div className="text-sm text-gray-500">
                Total: {formatNumber(stats.inscriptions.total)} inscriptions
              </div>
            </div>
            <div className="relative" style={{ height: '300px' }}>
              {chartData.inscriptions && chartData.inscriptions.length > 0 ? (
                <div className="w-full h-full flex items-end justify-between gap-1">
                  {chartData.inscriptions.map((value, index) => {
                    const maxValue = Math.max(...chartData.inscriptions, 1);
                    const heightPercent = Math.max((value / maxValue) * 100, 4);
                    const label = chartData.labels?.[index];
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full">
                        <div className="relative flex-1 w-full flex items-end">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                            style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                          >
                            <div className="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              {formatNumber(value)} inscriptions
                            </div>
                          </div>
                        </div>
                        {label && label !== '' && (
                          <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                            {label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement des données...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Évolution des revenus
              </h3>
              <div className="text-sm text-gray-500">
                Total: {formatCurrency(stats.revenus.total)}
              </div>
            </div>
            <div className="relative" style={{ height: '300px' }}>
              {chartData.revenus && chartData.revenus.length > 0 ? (
                <div className="w-full h-full flex items-end justify-between gap-1">
                  {chartData.revenus.map((value, index) => {
                    const maxValue = Math.max(...chartData.revenus, 1);
                    const heightPercent = Math.max((value / maxValue) * 100, 4);
                    const label = chartData.labels?.[index];
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full">
                        <div className="relative flex-1 w-full flex items-end">
                          <div 
                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500 cursor-pointer"
                            style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                          >
                            <div className="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              {formatCurrency(value)}
                            </div>
                          </div>
                        </div>
                        {label && label !== '' && (
                          <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                            {label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement des données...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-xl">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Chargement des données MongoDB...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistiques;