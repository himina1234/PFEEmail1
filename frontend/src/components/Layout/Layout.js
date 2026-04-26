// components/Layout/Layout.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useUser } from "../context/UserContext";
import SidebarAdmin from "./SidebarAdmin";
import SidebarFormateur from "./SidebarFormateur";
import SidebarFormateurEtab from "./SidebarFormateurEtab";
import SidebarApprenant from "./SidebarApprenant";
import Header from "./Header";
import ChatbotIntelligent from "../ChatbotIntelligent";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { currentUser } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserData = JSON.parse(
    localStorage.getItem("currentUser") || "{}",
  );

  // ✅ Charger l'état de la sidebar depuis localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    if (savedState !== null) {
      setSidebarOpen(savedState === "true");
    }
  }, []);

  useEffect(() => {
    const role = currentUserData?.role || user?.role || currentUser?.role;
    console.log("🎯 Layout: Rôle détecté -", role);
    setUserRole(role);
    setLoading(false);
  }, [currentUserData, user, currentUser]);

  // ✅ Fonction pour toggler la sidebar avec sauvegarde
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", newState);
  };

  const renderSidebar = () => {
    if (loading) {
      return (
        <aside
          className={`bg-white flex items-center justify-center transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0055a2]"></div>
        </aside>
      );
    }

    // ✅ Passer onToggle à chaque sidebar
    if (userRole === "admin") {
      return <SidebarAdmin isOpen={sidebarOpen} onToggle={toggleSidebar} />;
    } else if (userRole === "formateur") {
      return <SidebarFormateur isOpen={sidebarOpen} onToggle={toggleSidebar} />;
    } else if (userRole === "formateur-etab") {
      return (
        <SidebarFormateurEtab isOpen={sidebarOpen} onToggle={toggleSidebar} />
      );
    } else {
      return <SidebarApprenant isOpen={sidebarOpen} onToggle={toggleSidebar} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {renderSidebar()}
      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* ✅ Passer les props au Header */}
        <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
      <ChatbotIntelligent
        userId={currentUserData?.id || user?.id || currentUser?.id}
        userRole={currentUserData?.role || user?.role || currentUser?.role}
      />
    </div>
  );
};

export default Layout;
