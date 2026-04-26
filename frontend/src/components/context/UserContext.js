import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Charger les données initiales
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const savedUser = localStorage.getItem("currentUser");
    const savedUsers = localStorage.getItem("users");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedUser !== "undefined") {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erreur parsing savedUser:", error);
      }
    }
    if (savedUsers && savedUsers !== "undefined") {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (error) {
        console.error("Erreur parsing savedUsers:", error);
      }
    }
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false);
  };

  // ✅ FONCTION LOGIN (AJOUTÉE)
  const login = (userData, authToken) => {
    setCurrentUser(userData);
    setToken(authToken);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("token", authToken);

    // Mettre à jour la liste des utilisateurs si nécessaire
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (error) {}
    }

    // Déclencher un événement pour informer les autres composants
    window.dispatchEvent(new CustomEvent("loginSuccess", { detail: userData }));
  };

  // ✅ FONCTION LOGOUT (AJOUTÉE)
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    // On garde les utilisateurs stockés pour la prochaine connexion

    // Déclencher un événement pour informer les autres composants
    window.dispatchEvent(new CustomEvent("logoutSuccess"));
  };

  // Mettre à jour l'utilisateur actuel
  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    // Mettre à jour aussi dans la liste des utilisateurs
    const updatedUsers = users.map((u) =>
      u.id === updatedUser.id ? { ...u, ...updatedUser } : u,
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Déclencher un événement
    window.dispatchEvent(
      new CustomEvent("profileUpdated", { detail: updatedUser }),
    );
  };

  // Mettre à jour la liste des utilisateurs
  const updateUsersList = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  // Ajouter des utilisateurs
  const addUsers = (newUsers) => {
    const updatedUsers = [...users, ...newUsers];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  // Rafraîchir les données
  const refreshUserData = () => {
    loadUserData();
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!currentUser && !!token;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        loading,
        token,
        isAuthenticated,
        login, // ← AJOUTÉ
        logout, // ← AJOUTÉ
        updateCurrentUser,
        updateUsersList,
        addUsers,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
