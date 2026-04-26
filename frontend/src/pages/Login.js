// pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        matricule,
        password
      });

      if (response.data.success) {
        const user = response.data.user;
        
        // Déterminer le dashboard selon le rôle ET le type de formateur
        let redirectPath = '/';
        
        if (user.role === 'admin') {
          redirectPath = '/dashboard';
        } 
        else if (user.role === 'formateur') {
          if (user.formateurType === 'enseignant') {
            redirectPath = '/enseignant';
          } else {
            redirectPath = '/formateur';
          }
        } 
        else if (user.role === 'apprenant') {
          redirectPath = '/apprenant';
        }
        
        // Stocker les informations utilisateur
        const userForStorage = {
          id: user.id,
          matricule: user.matricule,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          formateurType: user.formateurType,
          fullName: `${user.prenom} ${user.nom}`,
          email: user.email,
          telephone: user.telephone,
          avatar: user.avatar || (user.role === 'admin' ? '👑' : user.role === 'formateur' ? '🎓' : '👤')
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userForStorage));
        localStorage.setItem('token', response.data.token);
        
        console.log('✅ Connexion réussie - Redirection vers:', redirectPath);
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      if (err.response?.status === 403) {
        if (err.response?.data?.code === 'EMAIL_NOT_VALIDATED') {
          setError('❌ Veuillez valider votre email via le lien reçu.');
        } else if (err.response?.data?.code === 'PENDING_APPROVAL') {
          setError('⏳ Votre compte est en attente d\'activation par un administrateur.');
        } else {
          setError(err.response?.data?.message || 'Compte désactivé');
        }
      } else {
        setError(err.response?.data?.message || 'Matricule ou mot de passe incorrect');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-[420px] p-8 rounded-3xl bg-white border border-gray-200 shadow-xl mx-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">AP</span>
            </div>
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
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Matricule
            </label>
            <input
              type="text"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Ex: ADMIN001 ou FRM20260001"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg shadow-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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