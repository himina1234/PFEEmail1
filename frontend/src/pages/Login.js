// Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Vérifier d'abord dans localStorage (utilisateurs importés/existants)
      const savedUsers = localStorage.getItem('users');
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      const localUser = users.find(
        u => u.matricule === matricule && u.password === password
      );

      if (localUser) {
        // Gestion utilisateur localStorage
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

        // Définir l'avatar selon le rôle
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
        
        // Utiliser le rôle réel de l'utilisateur depuis MongoDB
        let userRole = userData.role; // 'apprenant', 'formateur', ou 'admin'
        let redirectPath = '';
        
        // ✅ CORRECTION: Déterminer la redirection basée sur le rôle réel avec les bons chemins
        if (userRole === 'admin') {
          redirectPath = '/dashboard';
        } else if (userRole === 'formateur') {
          redirectPath = '/formateur';
        } else {
          userRole = 'user'; // Normaliser pour l'UI
          redirectPath = '/apprenant';  // ✅ Chemin correct avec slash
        }
        
        // Avatar basé sur le rôle réel
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
          source: 'mongodb',
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userForStorage));
        
        // Stocker également le token si présent
        if (result.payload.token) {
          localStorage.setItem('token', result.payload.token);
        }
        
        // ✅ Rediriger vers le bon chemin
        navigate(redirectPath);
      } else {
        setError('Matricule ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[300px] h-[300px] bg-cyan-400/20 blur-[100px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* Card */}
      <div className="relative z-10 w-[420px] p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">📱</span>
          </div>

          <h2 className="text-3xl font-bold text-white">
            Messagerie Pro
          </h2>

          <p className="text-gray-300 mt-2 text-sm">
            Connectez-vous avec votre matricule
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Matricule Field */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Matricule
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>

              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none transition"
                placeholder="Ex: ADMIN001, A20263792, F20261824"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Mot de passe
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none transition"
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Contactez l'administrateur pour obtenir vos identifiants
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;