// pages/ValidateAccount.js - Version corrigée
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';

const ValidateAccount = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [matricule, setMatricule] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const validateEmail = async () => {
      const token = searchParams.get('token');
      const emailParam = searchParams.get('email');
      
      console.log('🔍 URL complète:', window.location.href);
      console.log('🔍 Email param:', emailParam);
      console.log('🔍 Token param:', token);
      
      if (!emailParam) {
        setStatus('error');
        setMessage('❌ Email manquant dans le lien de validation.');
        setStatus('loading');
        return;
      }
      
      setEmail(emailParam);
      
      if (!token) {
        setStatus('error');
        setMessage('❌ Token de validation manquant.');
        setStatus('loading');
        return;
      }
      
      try {
        // Appel direct à l'API de validation POST (recommandé)
        const response = await fetch('http://localhost:5000/api/auth/validate-account-direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailParam,
            token: token
          })
        });
        
        const result = await response.json();
        console.log('📥 Réponse du serveur:', result);
        
        if (result.success) {
          // Succès - email validé
          setStatus('success');
          setMatricule(result.matricule || '');
          setUserName(result.name || '');
          setMessage('✅ Votre email a été validé avec succès !');
        } else {
          // Gestion des erreurs
          switch(result.error) {
            case 'user_not_found':
              setStatus('error');
              setMessage('❌ Utilisateur non trouvé. Veuillez contacter l\'administrateur.');
              break;
            case 'already_validated':
              setStatus('warning');
              setMessage('⚠️ Votre email a déjà été validé.');
              break;
            case 'invalid_token':
              setStatus('error');
              setMessage('❌ Lien de validation invalide.');
              break;
            case 'expired_token':
              setStatus('error');
              setMessage('❌ Ce lien de validation a expiré.');
              break;
            default:
              setStatus('error');
              setMessage(result.message || '❌ Erreur lors de la validation.');
          }
        }
      } catch (error) {
        console.error('❌ Erreur réseau:', error);
        setStatus('error');
        setMessage('❌ Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
      }
    };
    
    validateEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Validation en cours...</h2>
            <p className="text-gray-600 mt-2">Veuillez patienter...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Email validé !</h2>
            <p className="text-gray-600">{message}</p>
            
            {userName && (
              <p className="text-lg font-semibold text-gray-800 mt-4">
                Bienvenue {userName} !
              </p>
            )}
            
            {matricule && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Votre matricule :</p>
                <p className="text-xl font-bold text-blue-600">{matricule}</p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock size={20} className="text-amber-600" />
                <span className="font-semibold text-amber-700">En attente d'activation</span>
              </div>
              <p className="text-sm text-amber-700">
                Votre compte est maintenant en attente d'activation par un administrateur.
              </p>
              <p className="text-sm text-amber-600 mt-2">
                Vous recevrez un email dès que votre compte sera activé.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Retour à la connexion <ArrowRight size={18} />
            </button>
          </>
        )}
        
        {status === 'warning' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-600">Déjà validé</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Retour à la connexion
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">Erreur</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            
            <div className="mt-4 space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Réessayer
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Retour à la connexion
              </button>
              
              {/* Bouton debug pour créer l'utilisateur */}
              <button
                onClick={async () => {
                  const emailParam = searchParams.get('email');
                  if (emailParam) {
                    window.location.href = `http://localhost:5000/api/debug/create-missing-user?email=${encodeURIComponent(emailParam)}`;
                  }
                }}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition text-sm"
              >
                🔧 Créer mon compte automatiquement
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ValidateAccount;