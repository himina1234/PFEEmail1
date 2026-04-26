// App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./components/context/UserContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersManagement from "./pages/UsersManagement";
import Profile from "./pages/Profile";
import Layout from "./components/Layout/Layout";
import ApprenantDashboard from "./pages/ApprenantDashboard";
import FormateurDashboard from "./pages/FormateurDashboard";
import EnseignantDashboard from "./pages/EnseignantDashboard"; // À créer
import ServiceManagement from "./pages/ServiceManagement";
import FormationManagement from "./pages/FormationManagement";
import Statistiques from "./pages/Statistiques";
import Chat from "./pages/Chat";
import LandingPage from "./pages/LandingPage";
import ApprenantFormations from "./pages/ApprenantFormations";
import AdminInscriptions from "./pages/AdminInscriptions";
import ApprenantMesFormations from "./pages/ApprenantMesFormations";
import ApprenantPlanning from "./pages/ApprenantPlanning";
import ApprenantCahierSuivi from "./pages/ApprenantCahierSuivi";
import ValidateAccount from './pages/ValidateAccount';
// ✅ VÉRIFICATION DU RÔLE ET TYPE
const getUserRole = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return null;
  try {
    const user = JSON.parse(currentUser);
    return user;
  } catch (error) {
    return null;
  }
};

// ✅ ROUTE ADMIN
const AdminRoute = ({ children }) => {
  const user = getUserRole();
  if (!user) return <Navigate to="/login" />;
  if (user.role === "admin") return children;
  if (user.role === "formateur") {
    if (user.formateurType === "enseignant") return <Navigate to="/enseignant" />;
    return <Navigate to="/formateur" />;
  }
  if (user.role === "apprenant") return <Navigate to="/apprenant" />;
  return <Navigate to="/login" />;
};

// ✅ ROUTE APPRENANT
const ApprenantRoute = ({ children }) => {
  const user = getUserRole();
  if (!user) return <Navigate to="/login" />;
  if (user.role === "apprenant") return children;
  if (user.role === "admin") return <Navigate to="/dashboard" />;
  if (user.role === "formateur") {
    if (user.formateurType === "enseignant") return <Navigate to="/enseignant" />;
    return <Navigate to="/formateur" />;
  }
  return <Navigate to="/login" />;
};

// ✅ ROUTE FORMATEUR (type formateur uniquement)
const FormateurRoute = ({ children }) => {
  const user = getUserRole();
  if (!user) return <Navigate to="/login" />;
  if (user.role === "formateur" && user.formateurType === "formateur") return children;
  if (user.role === "admin") return <Navigate to="/dashboard" />;
  if (user.role === "formateur" && user.formateurType === "enseignant") return <Navigate to="/enseignant" />;
  if (user.role === "apprenant") return <Navigate to="/apprenant" />;
  return <Navigate to="/login" />;
};

// ✅ ROUTE ENSEIGNANT (type enseignant uniquement)
const EnseignantRoute = ({ children }) => {
  const user = getUserRole();
  if (!user) return <Navigate to="/login" />;
  if (user.role === "formateur" && user.formateurType === "enseignant") return children;
  if (user.role === "admin") return <Navigate to="/dashboard" />;
  if (user.role === "formateur" && user.formateurType === "formateur") return <Navigate to="/formateur" />;
  if (user.role === "apprenant") return <Navigate to="/apprenant" />;
  return <Navigate to="/login" />;
};

// ✅ ROUTE USER GÉNÉRIQUE
const UserRoute = ({ children }) => {
  const user = getUserRole();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* PAGE D'ACCUEIL */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/accueil" element={<LandingPage />} />

          {/* PAGE DE LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* Routes Admin */}
          <Route path="/dashboard" element={<AdminRoute><Layout><Dashboard /></Layout></AdminRoute>} />
          <Route path="/formations" element={<AdminRoute><Layout><FormationManagement /></Layout></AdminRoute>} />
          <Route path="/admin/inscriptions" element={<AdminRoute><Layout><AdminInscriptions /></Layout></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><Layout><UsersManagement /></Layout></AdminRoute>} />
          <Route path="/services" element={<AdminRoute><Layout><ServiceManagement /></Layout></AdminRoute>} />
          <Route path="/statistiques" element={<AdminRoute><Layout><Statistiques /></Layout></AdminRoute>} />

          {/* Routes Apprenant */}
          <Route path="/apprenant" element={<ApprenantRoute><Layout><ApprenantDashboard /></Layout></ApprenantRoute>} />
          <Route path="/apprenant/mes-formations" element={<ApprenantRoute><Layout><ApprenantMesFormations /></Layout></ApprenantRoute>} />
          <Route path="/apprenant/planning" element={<ApprenantRoute><Layout><ApprenantPlanning /></Layout></ApprenantRoute>} />
          <Route path="/apprenant/cahier-suivi" element={<ApprenantRoute><Layout><ApprenantCahierSuivi /></Layout></ApprenantRoute>} />
          <Route path="/apprenant/formations" element={<ApprenantRoute><Layout><ApprenantFormations /></Layout></ApprenantRoute>} />

          {/* Routes Formateur (type formateur) */}
          <Route path="/formateur" element={<FormateurRoute><Layout><FormateurDashboard /></Layout></FormateurRoute>} />

          {/* Routes Enseignant (type enseignant) */}
          <Route path="/enseignant" element={<EnseignantRoute><Layout><EnseignantDashboard /></Layout></EnseignantRoute>} />

          {/* Route Profil (accessible à tous connectés) */}
          <Route path="/profile" element={<UserRoute><Layout><Profile /></Layout></UserRoute>} />
          <Route path="/chat" element={<Chat />} />

          {/* Redirection */}
          <Route path="/validate-account" element={<ValidateAccount />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;