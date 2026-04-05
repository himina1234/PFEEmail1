import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données initiales
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('users');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    setLoading(false);
  };

  // Mettre à jour l'utilisateur actuel
  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Mettre à jour aussi dans la liste des utilisateurs
    const updatedUsers = users.map(u => 
      u.id === updatedUser.id ? { ...u, ...updatedUser } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // Mettre à jour la liste des utilisateurs
  const updateUsersList = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // Ajouter des utilisateurs
  const addUsers = (newUsers) => {
    const updatedUsers = [...users, ...newUsers];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // Rafraîchir les données
  const refreshUserData = () => {
    loadUserData();
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      loading,
      updateCurrentUser,
      updateUsersList,
      addUsers,
      refreshUserData
    }}>
      {children}
    </UserContext.Provider>
  );
};