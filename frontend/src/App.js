// App.js - Version corrigée
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

// ✅ ROUTE ADMIN CORRIGÉE - Utilise uniquement localStorage
const AdminRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");

  console.log("🔍 AdminRoute - currentUser:", currentUser);

  if (!currentUser) {
    console.log("❌ Pas d'utilisateur, redirection login");
    return <Navigate to="/login" />;
  }

  try {
    const user = JSON.parse(currentUser);
    console.log("👤 Rôle utilisateur:", user.role);

    // Vérifier si l'utilisateur est admin
    if (user.role === "admin") {
      console.log("✅ Admin autorisé");
      return children;
    }

    // Rediriger selon le rôle
    if (user.role === "formateur") {
      console.log("➡️ Redirection vers formateur");
      return <Navigate to="/formateur" />;
    }
    if (user.role === "user" || user.role === "apprenant") {
      console.log("➡️ Redirection vers apprenant");
      return <Navigate to="/apprenant" />;
    }
  } catch (error) {
    console.error("Erreur lors de la lecture du user:", error);
  }

  console.log("❌ Redirection vers login par défaut");
  return <Navigate to="/login" />;
};

// ✅ ROUTE USER CORRIGÉE
const UserRoute = ({ children, allowedRoles = [] }) => {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  try {
    const user = JSON.parse(currentUser);
    if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
      return children;
    }
    if (user.role === "admin") {
      return <Navigate to="/dashboard" />;
    }
    if (user.role === "formateur") {
      return <Navigate to="/formateur" />;
    }
    if (user.role === "user" || user.role === "apprenant") {
      return <Navigate to="/apprenant" />;
    }
  } catch (error) {
    console.error("Erreur lors de la lecture du user:", error);
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

          {/* ✅ ROUTE ADMIN INSCRIPTIONS - CORRIGÉE */}
          <Route
            path="/admin/inscriptions"
            element={
              <AdminRoute>
                <Layout>
                  <AdminInscriptions />
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

          {/* Route Apprenant Dashboard */}
          <Route
            path="/apprenant"
            element={
              <UserRoute allowedRoles={["user", "apprenant"]}>
                <Layout>
                  <ApprenantDashboard />
                </Layout>
              </UserRoute>
            }
          />
          <Route
            path="/apprenant/mes-formations"
            element={
              <UserRoute allowedRoles={["user", "apprenant"]}>
                <Layout>
                  <ApprenantMesFormations />
                </Layout>
              </UserRoute>
            }
          />
          <Route
            path="/apprenant/planning"
            element={
              <UserRoute allowedRoles={["user", "apprenant"]}>
                <Layout>
                  <ApprenantPlanning />
                </Layout>
              </UserRoute>
            }
          />
          <Route
            path="/apprenant/cahier-suivi"
            element={
              <UserRoute allowedRoles={["user", "apprenant"]}>
                <Layout>
                  <ApprenantCahierSuivi />
                </Layout>
              </UserRoute>
            }
          />

          {/* Route Apprenant Formations */}
          <Route
            path="/apprenant/formations"
            element={
              <UserRoute allowedRoles={["user", "apprenant"]}>
                <Layout>
                  <ApprenantFormations />
                </Layout>
              </UserRoute>
            }
          />

          {/* Route Formateur Dashboard */}
          <Route
            path="/formateur"
            element={
              <UserRoute allowedRoles={["formateur"]}>
                <Layout>
                  <FormateurDashboard />
                </Layout>
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

          {/* Redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
