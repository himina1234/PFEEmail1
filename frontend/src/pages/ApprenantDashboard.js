// pages/ApprenantDashboard.js
import React from 'react';
import { BookOpen, Calendar, FileText, Trophy, Clock, Users } from 'lucide-react';

const ApprenantDashboard = () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Apprenant
        </h1>
        <p className="text-gray-500 mt-1">
          Bienvenue, <strong>{user.prenom} {user.nom}</strong>
        </p>
        <p className="text-sm text-gray-400">
          Matricule: {user.matricule}
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mes formations</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Certificats</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Trophy size={24} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Progression</p>
              <p className="text-2xl font-bold text-gray-800">0%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Section formations disponibles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Mes formations</h2>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500">Aucune formation pour le moment</p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Explorer les formations
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprenantDashboard;