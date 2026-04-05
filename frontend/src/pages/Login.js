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
      const savedUsers = localStorage.getItem('users');
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      const localUser = users.find(
        u => u.matricule === matricule && u.password === password
      );

      if (localUser) {
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

        const userData = {
          id: localUser.id,
          matricule: localUser.matricule,
          nom: localUser.nom,
          prenom: localUser.prenom,
          role: userRole,
          avatar:
            userRole === 'formateur'
              ? '🎓'
              : userRole === 'admin'
              ? '👑'
              : '👤',
          fullName: `${localUser.prenom} ${localUser.nom}`,
          email: localUser.email || '',
          telephone: localUser.telephone || '',
          source: 'localstorage',
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        navigate(redirectPath);
        return;
      }

      const result = await dispatch(login({ matricule, password }));

      if (!result.error && result.payload) {
        const userData = result.payload.user;

        const adminUser = {
          id: userData.id,
          matricule: userData.matricule,
          nom: userData.nom,
          prenom: userData.prenom || userData.nom,
          role: 'admin',
          avatar: '👑',
          fullName: `${userData.prenom || userData.nom} ${userData.nom}`,
          source: 'mongodb',
        };

        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        navigate('/dashboard');
      } else {
        setError('Matricule ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion');
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

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Matricule */}
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
                placeholder="Ex: ADMIN001, 2026XXXX"
                required
              />
            </div>
          </div>

          {/* Password */}
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

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
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