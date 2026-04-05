import React from 'react';

const UserCard = ({ user }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'formateur':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{user.nom}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-1">
        <span className="font-medium">Matricule:</span> {user.matricule}
      </p>
      <p className="text-gray-600 text-sm">
        <span className="font-medium">Email:</span> {user.email}
      </p>
      <p className="text-gray-400 text-xs mt-2">
        Créé le: {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default UserCard;