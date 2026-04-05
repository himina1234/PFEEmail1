import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Mail, User, Calendar } from 'lucide-react';

const UserCard = ({ user }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'formateur':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default:
        return 'bg-gradient-to-r from-green-500 to-green-600';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'formateur':
        return '🎓';
      default:
        return '📚';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mot de passe par défaut (à remplacer par celui de votre base de données)
  // Normalement, le backend ne retourne pas le mot de passe pour des raisons de sécurité
  // Nous devons modifier le backend pour inclure le mot de passe en clair
  const displayPassword = user.password || '********';

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className={`${getRoleColor(user.role)} px-4 py-3`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getRoleIcon(user.role)}</span>
            <h3 className="text-white font-bold text-lg">{user.nom}</h3>
          </div>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
            {user.role === 'formateur' ? 'Formateur' : user.role === 'admin' ? 'Admin' : 'Apprenant'}
          </span>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Matricule */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500 font-medium">MATRICULE</span>
            </div>
            <button
              onClick={() => copyToClipboard(user.matricule)}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-lg font-mono font-bold text-gray-800 mt-1">{user.matricule}</p>
        </div>

        {/* Email */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Mail className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500 font-medium">EMAIL</span>
          </div>
          <p className="text-sm text-gray-700 break-all">{user.email}</p>
        </div>

        {/* Mot de passe */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔑</span>
              <span className="text-xs text-yellow-700 font-bold">MOT DE PASSE</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-yellow-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(displayPassword)}
                className="text-gray-500 hover:text-yellow-600 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="font-mono font-bold text-yellow-800 text-base mt-1">
            {showPassword ? displayPassword : '••••••••'}
          </p>
          {!user.password && (
            <p className="text-xs text-yellow-600 mt-1">
              ⚠️ Mot de passe non disponible (hashé dans la base)
            </p>
          )}
        </div>

        {/* Date création */}
        <div className="flex items-center space-x-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
          <Calendar className="w-3 h-3" />
          <span>Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
};

const UserList = ({ users }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg">
        <div className="text-6xl mb-4">👥</div>
        <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
        <p className="text-gray-400 text-sm mt-2">Importez des utilisateurs depuis Excel pour commencer</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {users.map((user) => (
        <UserCard key={user._id} user={user} />
      ))}
    </div>
  );
};

export default UserList;