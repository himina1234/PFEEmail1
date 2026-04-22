// src/pages/AutoLogin.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginSuccess } from '../store/slices/authSlice';

const AutoLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const role = params.get('role');
    const nom = params.get('nom');
    const prenom = params.get('prenom');
    const matricule = params.get('matricule');
    const email = params.get('email');
    const justValidated = params.get('justValidated') === 'true';

    if (token && userId) {
      // Déterminer l'avatar selon le rôle
      let avatar = '👤';
      if (role === 'admin') avatar = '👑';
      else if (role === 'formateur') avatar = '🎓';

      // Préparer les données utilisateur
      const userData = {
        id: userId,
        matricule: matricule,
        nom: nom,
        prenom: prenom,
        role: role,
        email: email,
        avatar: avatar,
        fullName: `${prenom} ${nom}`,
        isEmailValidated: true
      };

      // Stocker dans localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Mettre à jour Redux avec loginSuccess
      dispatch(loginSuccess({ user: userData, token }));

      // Afficher un message de bienvenue
      if (justValidated) {
        alert(`✅ Bienvenue ${prenom} ${nom} !\n\nVotre compte a été validé avec succès.\nVous êtes maintenant connecté(e).`);
      } else {
        alert(`✅ Bon retour ${prenom} ${nom} !\n\nVous êtes maintenant connecté(e).`);
      }

      // Rediriger selon le rôle
      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'formateur') {
        navigate('/formateur');
      } else {
        navigate('/apprenant');
      }
    } else {
      // Pas de token, rediriger vers login
      navigate('/login');
    }
  }, [dispatch, navigate, location]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #4F46E5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }} />
        <h2 style={{ color: '#333', marginTop: '20px' }}>Connexion en cours...</h2>
        <p style={{ color: '#666' }}>Veuillez patienter, vous allez être redirigé automatiquement.</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AutoLogin;