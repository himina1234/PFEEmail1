// App.js - Version corrigée
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { UserProvider } from './components/context/UserContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersManagement from './pages/UsersManagement';
import Profile from './pages/Profile';
import Layout from './components/Layout/Layout';
import ApprenantDashboard from './pages/ApprenantDashboard';
import FormateurDashboard from './pages/FormateurDashboard';
import ServiceManagement from './pages/ServiceManagement'; 
import FormationManagement from './pages/FormationManagement';
import Statistiques from './pages/Statistiques';
import Chat from './pages/Chat';
import LandingPage from './pages/LandingPage';

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const currentUser = localStorage.getItem('currentUser');
  
  if (token && currentUser) {
    try {
      const user = JSON.parse(currentUser);
      if (user.role === 'admin') {
        return children;
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du user:', error);
    }
  }
  
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const currentUser = localStorage.getItem('currentUser');
  
  if (!token || !currentUser) {
    return <Navigate to="/login" />;
  }
  
  try {
    const user = JSON.parse(currentUser);
    if (user.role === 'admin') {
      return children;
    }
    if (user.role === 'formateur') {
      return <Navigate to="/formateur" />;
    }
    if (user.role === 'user') {
      return <Navigate to="/apprenant" />;
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du user:', error);
  }
  
  return <Navigate to="/login" />;
};

const UserRoute = ({ children, allowedRoles = [] }) => {
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  try {
    const user = JSON.parse(currentUser);
    if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
      return children;
    }
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" />;
    }
    if (user.role === 'formateur') {
      return <Navigate to="/formateur" />;
    }
    if (user.role === 'user') {
      return <Navigate to="/apprenant" />;
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du user:', error);
  }
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* PAGE D'ACCUEIL - EN PREMIER */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/accueil" element={<LandingPage />} />
          
          {/* PAGE DE LOGIN */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes Admin */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/formations"
            element={
              <AdminRoute>
                <Layout>
                  <FormationManagement />
                </Layout>
              </AdminRoute>
            }
          />
          
          <Route path="/chat" element={<Chat />} /> 
          
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Layout>
                  <UsersManagement />
                </Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/services"
            element={
              <AdminRoute>
                <Layout>
                  <ServiceManagement />
                </Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <UserRoute>
                <Layout>
                  <Profile />
                </Layout>
              </UserRoute>
            }
          />
          
          <Route
            path="/apprenant"
            element={
              <UserRoute allowedRoles={['user']}>
                <ApprenantDashboard />
              </UserRoute>
            }
          />
          
          <Route
            path="/formateur"
            element={
              <UserRoute allowedRoles={['formateur']}>
                <FormateurDashboard />
              </UserRoute>
            }
          />
          
          <Route
            path="/statistiques"
            element={
              <AdminRoute>
                <Layout>
                  <Statistiques />
                </Layout>
              </AdminRoute>
            }
          />
          
          {/* Redirection pour toutes les autres routes vers l'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;