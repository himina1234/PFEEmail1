// components/Layout/Layout.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatbotIntelligent from "../ChatbotIntelligent";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>

      {/* Chatbot intelligent - disponible sur toutes les pages */}
      <ChatbotIntelligent
        userId={currentUser?.id || user?.id}
        userRole={currentUser?.role || user?.role}
      />
    </div>
  );
};

export default Layout;
