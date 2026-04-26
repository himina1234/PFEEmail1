// pages/EnseignantDashboard.js
import React from 'react';

const EnseignantDashboard = () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Enseignant
        </h1>
        <p className="text-gray-500 mt-2">
          Bienvenue, {user.prenom} {user.nom}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold">Mes Cours</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm opacity-80 mt-2">Cours assignés</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold">Mes Élèves</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm opacity-80 mt-2">Apprenants suivis</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold">Évaluations</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm opacity-80 mt-2">À corriger</p>
        </div>
      </div>
    </div>
  );
};

export default EnseignantDashboard;