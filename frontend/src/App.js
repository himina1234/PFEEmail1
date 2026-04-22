// App.js - Version corrigée pour apprenant
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./components/context/UserContext";
import Login from "./pages/Login";
import AutoLogin from "./pages/AutoLogin";
import Dashboard from "./pages/Dashboard";
import UsersManagement from "./pages/UsersManagement";
import Profile from "./pages/Profile";
import Layout from "./components/Layout/Layout";
import ApprenantDashboard from "./pages/ApprenantDashboard";
import FormateurDashboard from "./pages/FormateurDashboard";
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

// ✅ ROUTE ADMIN
const AdminRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return <Navigate to="/login" />;
  try {
    const user = JSON.parse(currentUser);
    if (user.role === "admin") return children;
    if (user.role === "formateur") return <Navigate to="/formateur" />;
    if (user.role === "apprenant" || user.role === "user") return <Navigate to="/apprenant" />;
  } catch (error) {
    console.error(error);
  }
  return <Navigate to="/login" />;
};

// ✅ ROUTE APPRENANT (CORRIGÉE)
const ApprenantRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");
  console.log("🔍 ApprenantRoute - currentUser:", currentUser);
  
  if (!currentUser) {
    console.log("❌ Pas d'utilisateur, redirection login");
    return <Navigate to="/login" />;
  }
  
  try {
    const user = JSON.parse(currentUser);
    console.log("👤 Rôle utilisateur:", user.role);
    
    if (user.role === "apprenant" || user.role === "user") {
      console.log("✅ Apprenant autorisé");
      return children;
    }
    if (user.role === "admin") {
      console.log("➡️ Redirection admin vers dashboard");
      return <Navigate to="/dashboard" />;
    }
    if (user.role === "formateur") {
      console.log("➡️ Redirection formateur");
      return <Navigate to="/formateur" />;
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
  return <Navigate to="/login" />;
};

// ✅ ROUTE FORMATEUR
const FormateurRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return <Navigate to="/login" />;
  try {
    const user = JSON.parse(currentUser);
    if (user.role === "formateur") return children;
    if (user.role === "admin") return <Navigate to="/dashboard" />;
    if (user.role === "apprenant" || user.role === "user") return <Navigate to="/apprenant" />;
  } catch (error) {
    console.error(error);
  }
  return <Navigate to="/login" />;
};

// ✅ ROUTE USER GÉNÉRIQUE
const UserRoute = ({ children, allowedRoles = [] }) => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return <Navigate to="/login" />;
  try {
    const user = JSON.parse(currentUser);
    if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) return children;
    if (user.role === "admin") return <Navigate to="/dashboard" />;
    if (user.role === "formateur") return <Navigate to="/formateur" />;
    if (user.role === "apprenant" || user.role === "user") return <Navigate to="/apprenant" />;
  } catch (error) {
    console.error(error);
  }
  return <Navigate to="/login" />;
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
          <Route path="/auto-login" element={<AutoLogin />} />

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

          {/* Routes Formateur */}
          <Route path="/formateur" element={<FormateurRoute><Layout><FormateurDashboard /></Layout></FormateurRoute>} />

          {/* Route Profil (accessible à tous connectés) */}
          <Route path="/profile" element={<UserRoute><Layout><Profile /></Layout></UserRoute>} />
          <Route path="/chat" element={<Chat />} />

          {/* Redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;