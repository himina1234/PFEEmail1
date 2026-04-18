// Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Vérifier d'abord dans localStorage (fallback)
      const savedUsers = localStorage.getItem('users');
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      const localUser = users.find(
        u => u.matricule === matricule && u.password === password
      );

      if (localUser) {
        // VÉRIFICATION CRITIQUE : Vérifier si le compte est actif dans localStorage
        const isActive = localUser.status === 'actif' || localUser.status === 'active' || localUser.isActive === true || !localUser.status;
        
        if (!isActive) {
          setError('❌ Votre compte est désactivé. Veuillez contacter un administrateur.');
          setIsLoading(false);
          return;
        }

        let userRole = localUser.role;
        let redirectPath = '';

        if (userRole === 'admin') {
          redirectPath = '/dashboard';
        } else if (userRole === 'formateur') {
          redirectPath = '/formateur';
        } else {
          userRole = 'user';
          redirectPath = '/apprenant';
        }

        let avatar = '👤';
        if (userRole === 'admin') avatar = '👑';
        else if (userRole === 'formateur') avatar = '🎓';

        const userData = {
          id: localUser.id,
          matricule: localUser.matricule,
          nom: localUser.nom,
          prenom: localUser.prenom,
          role: userRole,
          avatar: avatar,
          fullName: `${localUser.prenom} ${localUser.nom}`,
          email: localUser.email || '',
          telephone: localUser.telephone || '',
          status: localUser.status || 'actif',
          source: 'localstorage',
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        navigate(redirectPath);
        return;
      }

      // 2. Sinon, essayer la connexion MongoDB
      const result = await dispatch(login({ matricule, password }));

      if (!result.error && result.payload) {
        const userData = result.payload.user;
        
        // VÉRIFICATION CRITIQUE : Vérifier le statut retourné par le serveur
        const userStatus = userData.status || userData.isActive;
        const isActive = userStatus === 'actif' || userStatus === 'active' || userStatus === true;
        
        if (!isActive) {
          setError('❌ Votre compte est désactivé. Veuillez contacter un administrateur.');
          setIsLoading(false);
          return;
        }
        
        let userRole = userData.role;
        let redirectPath = '';
        
        if (userRole === 'admin') {
          redirectPath = '/dashboard';
        } else if (userRole === 'formateur') {
          redirectPath = '/formateur';
        } else {
          userRole = 'user';
          redirectPath = '/apprenant';
        }
        
        let avatar = '👤';
        if (userRole === 'admin') avatar = '👑';
        else if (userRole === 'formateur') avatar = '🎓';
        
        const userForStorage = {
          id: userData.id,
          matricule: userData.matricule,
          nom: userData.nom,
          prenom: userData.prenom || userData.nom,
          role: userRole,
          avatar: avatar,
          fullName: `${userData.prenom || userData.nom} ${userData.nom}`,
          email: userData.email,
          telephone: userData.telephone,
          status: userData.status || 'actif',
          source: 'mongodb',
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userForStorage));
        if (result.payload.token) {
          localStorage.setItem('token', result.payload.token);
        }
        navigate(redirectPath);
      } else {
        setError('Matricule ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      // Gérer l'erreur 403 (compte désactivé)
      if (err.response?.status === 403) {
        setError('❌ Votre compte est désactivé. Veuillez contacter un administrateur.');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-[420px] p-8 rounded-3xl bg-white border border-gray-200 shadow-xl mx-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-3">
            <img 
              src="../image/imag4.jpg" 
              alt="Algérie Poste Logo" 
              className="h-20 w-auto object-contain mb-2" 
            />
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-blue-900 leading-none uppercase">
                Algérie Poste
              </span>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-yellow-500 mt-1">
                Learning
              </span>
            </div>
          </div>
          <p className="text-gray-500 mt-4 text-sm">
            Connectez-vous avec votre matricule
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Matricule Field */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Matricule
            </label>
            <div className="relative">
              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Entrez votre matricule"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Algérie Poste - Plateforme de formation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;