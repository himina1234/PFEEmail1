// frontend/src/pages/ApprenantMesFormations.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Calendar,
  ChevronLeft,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  Award,
  Trash2,
  Loader2,
} from "lucide-react";

const ApprenantMesFormations = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("inscrites");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMesInscriptions();
  }, []);

  const fetchMesInscriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/formations/mes-inscriptions",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setInscriptions(data.data);
        } else {
          setInscriptions([]);
        }
      } else {
        setError("Erreur lors du chargement");
        setInscriptions([]);
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
      setError("Erreur de connexion au serveur");
      setInscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/apprenant");
  };

  const handleDeleteInscription = async (inscriptionId) => {
    if (!window.confirm("Supprimer cette demande ?")) return;

    setDeletingId(inscriptionId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/formations/inscription/${inscriptionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        alert("Demande supprimée");
        fetchMesInscriptions();
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case "confirmee":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={12} /> Inscrit
          </span>
        );
      case "en_attente":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <ClockIcon size={12} /> En attente
          </span>
        );
      case "refusee":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={12} /> Refusée
          </span>
        );
      case "terminee":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <GraduationCap size={12} /> Terminée
          </span>
        );
      default:
        return null;
    }
  };

  const inscrites = inscriptions.filter((i) => i.statut === "confirmee");
  const enAttente = inscriptions.filter((i) => i.statut === "en_attente");
  const refusees = inscriptions.filter((i) => i.statut === "refusee");
  const terminees = inscriptions.filter((i) => i.statut === "terminee");

  const getTabContent = () => {
    switch (activeTab) {
      case "inscrites":
        return inscrites;
      case "en_attente":
        return enAttente;
      case "refusees":
        return refusees;
      case "terminees":
        return terminees;
      default:
        return inscrites;
    }
  };

  const tabs = [
    {
      id: "inscrites",
      label: "Inscrit",
      count: inscrites.length,
      icon: CheckCircle,
    },
    {
      id: "en_attente",
      label: "En attente",
      count: enAttente.length,
      icon: ClockIcon,
    },
    {
      id: "refusees",
      label: "Refusée",
      count: refusees.length,
      icon: XCircle,
    },
    {
      id: "terminees",
      label: "Terminée",
      count: terminees.length,
      icon: Award,
    },
  ];

  const currentItems = getTabContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Mes formations</h1>
        </div>
      </div>

      <main className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Onglets */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#2b5ea7] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenu de l'onglet */}
        {currentItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Aucune formation
            </h3>
            <p className="text-gray-400">
              {activeTab === "inscrites" &&
                "Vous n'êtes inscrit à aucune formation"}
              {activeTab === "en_attente" && "Aucune demande en attente"}
              {activeTab === "refusees" && "Aucune demande refusée"}
              {activeTab === "terminees" && "Aucune formation terminée"}
            </p>
            {activeTab === "inscrites" && (
              <button
                onClick={() => navigate("/apprenant/formations")}
                className="mt-4 px-6 py-2.5 bg-[#2b5ea7] text-white rounded-lg hover:bg-[#1e4a8a] transition-colors"
              >
                Découvrir les formations
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentItems.map((inscription) => (
              <div
                key={inscription._id}
                className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden hover:shadow-md transition-shadow ${
                  activeTab === "inscrites"
                    ? "border-green-500"
                    : activeTab === "en_attente"
                      ? "border-yellow-500"
                      : activeTab === "refusees"
                        ? "border-red-500"
                        : "border-blue-500"
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                      {inscription.formationDomaine}
                    </span>
                    {getStatutBadge(inscription.statut)}
                  </div>

                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    {inscription.formationTitre}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar size={14} />
                    <span>
                      {activeTab === "inscrites"
                        ? "Inscrit le "
                        : "Demandée le "}
                      {new Date(
                        inscription.demandeEnvoyeeLe,
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {inscription.messageApprenant &&
                    activeTab === "en_attente" && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Votre message :</p>
                        <p className="text-sm text-gray-700">
                          {inscription.messageApprenant}
                        </p>
                      </div>
                    )}

                  {inscription.messageAdmin && (
                    <div
                      className={`mt-2 p-2 rounded-lg ${
                        activeTab === "refusees" ? "bg-red-50" : "bg-blue-50"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          activeTab === "refusees"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {activeTab === "refusees"
                          ? "Motif du refus :"
                          : "Message :"}
                      </p>
                      <p
                        className={`text-sm ${
                          activeTab === "refusees"
                            ? "text-red-700"
                            : "text-blue-700"
                        }`}
                      >
                        {inscription.messageAdmin}
                      </p>
                    </div>
                  )}

                  {activeTab === "en_attente" && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
                      <ClockIcon size={16} className="text-yellow-600" />
                      <p className="text-sm text-yellow-700">
                        En attente de validation
                      </p>
                    </div>
                  )}

                  {activeTab === "inscrites" && (
                    <button
                      onClick={() =>
                        alert(`Démarrer: ${inscription.formationTitre}`)
                      }
                      className="mt-4 w-full py-2.5 bg-[#2b5ea7] text-white rounded-lg hover:bg-[#1e4a8a] transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Play size={16} /> Commencer la formation
                    </button>
                  )}

                  {activeTab === "terminees" && (
                    <button
                      onClick={() =>
                        navigate(
                          `/apprenant/certificat/${inscription.formationId}`,
                        )
                      }
                      className="mt-4 w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Award size={16} /> Voir le certificat
                    </button>
                  )}

                  {activeTab === "refusees" && (
                    <button
                      onClick={() => handleDeleteInscription(inscription._id)}
                      disabled={deletingId === inscription._id}
                      className="mt-4 w-full py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {deletingId === inscription._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={16} /> Supprimer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ApprenantMesFormations;
