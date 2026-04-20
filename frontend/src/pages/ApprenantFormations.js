// frontend/src/pages/ApprenantFormations.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  Search,
  Clock,
  Users,
  Play,
  FileText,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Clock as ClockIcon,
  Send,
  RefreshCw,
} from "lucide-react";

const ApprenantFormations = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [formations, setFormations] = useState([]);
  const [mesInscriptions, setMesInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscriptionLoading, setInscriptionLoading] = useState(null);
  const [showInscriptionModal, setShowInscriptionModal] = useState(null);
  const [inscriptionMessage, setInscriptionMessage] = useState("");
  const [inscriptionStatus, setInscriptionStatus] = useState(null);

  // Récupérer les formations et les inscriptions de l'apprenant
  useEffect(() => {
    Promise.all([fetchFormations(), fetchMesInscriptions()]).then(() => {
      setLoading(false);
    });
  }, []);

  const fetchFormations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/formations", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const formattedFormations = data.data.map((formation, index) => ({
            id: formation._id || index,
            titre: formation.titre,
            categorie: formation.domaine || "Général",
            duree: formation.duree
              ? `${formation.duree} mois`
              : "Non spécifiée",
            inscrits: 0,
            progression: 0,
            statut: "available",
            description: formation.description,
            placesDisponibles: formation.placesDisponibles || 0,
          }));
          setFormations(formattedFormations);
        } else {
          setFormations([]);
        }
      } else {
        setError("Impossible de charger les formations");
        setFormations([]);
      }
    } catch (error) {
      console.error("Erreur chargement formations:", error);
      setError("Erreur de connexion au serveur");
      setFormations([]);
    }
  };

  const fetchMesInscriptions = async () => {
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
          setMesInscriptions(data.data);
        }
      }
    } catch (error) {
      console.error("Erreur chargement inscriptions:", error);
    }
  };

  const handleBack = () => {
    navigate("/apprenant");
  };

  // Vérifier le statut d'une formation
  const getFormationStatus = (formationId) => {
    const inscription = mesInscriptions.find(
      (insc) => insc.formationId === formationId,
    );
    if (inscription) {
      return inscription.statut;
    }
    return null;
  };

  const hasDemandeEnCours = (formationId) => {
    return mesInscriptions.some(
      (insc) =>
        insc.formationId === formationId && insc.statut === "en_attente",
    );
  };

  const hasDemandeAcceptee = (formationId) => {
    return mesInscriptions.some(
      (insc) => insc.formationId === formationId && insc.statut === "confirmee",
    );
  };

  const hasDemandeRefusee = (formationId) => {
    return mesInscriptions.some(
      (insc) => insc.formationId === formationId && insc.statut === "refusee",
    );
  };

  // Nouvelle fonction pour re-demander une formation refusée
  const handleReinscrire = async (formation) => {
    setInscriptionLoading(formation.id);
    setInscriptionMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/formations/inscrire",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            formationId: formation.id,
            formationTitre: formation.titre,
            formationDomaine: formation.categorie,
            message: "",
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setInscriptionStatus({ success: true, message: data.message });
        await fetchMesInscriptions();
        setTimeout(() => {
          setInscriptionStatus(null);
        }, 2000);
      } else {
        setInscriptionStatus({
          success: false,
          message: data.message || "Erreur lors de l'inscription",
        });
      }
    } catch (error) {
      console.error("Erreur inscription:", error);
      setInscriptionStatus({
        success: false,
        message: "Erreur de connexion au serveur",
      });
    } finally {
      setInscriptionLoading(null);
    }
  };

  // Filtrer les formations selon l'onglet sélectionné
  const getFilteredFormations = () => {
    let filtered = [...formations];

    switch (filterType) {
      case "available":
        // Uniquement les formations disponibles (sans demande en cours et sans acceptation)
        // Les formations refusées réapparaissent ici !
        filtered = filtered.filter(
          (formation) =>
            !hasDemandeAcceptee(formation.id) &&
            !hasDemandeEnCours(formation.id),
        );
        break;
      case "mes_demandes":
        // Uniquement les formations avec demande en attente
        filtered = filtered.filter((formation) =>
          hasDemandeEnCours(formation.id),
        );
        break;
      case "refusees":
        // Uniquement les formations refusées
        filtered = filtered.filter((formation) =>
          hasDemandeRefusee(formation.id),
        );
        break;
      case "all":
      default:
        // Toutes les formations (sauf celles acceptées)
        filtered = filtered.filter(
          (formation) => !hasDemandeAcceptee(formation.id),
        );
        break;
    }

    // Appliquer la recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (formation) =>
          formation.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formation.categorie?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  const handleInscription = async (formation) => {
    setInscriptionLoading(formation.id);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/formations/inscrire",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            formationId: formation.id,
            formationTitre: formation.titre,
            formationDomaine: formation.categorie,
            message: inscriptionMessage,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setInscriptionStatus({ success: true, message: data.message });
        await fetchMesInscriptions();
        setTimeout(() => {
          setShowInscriptionModal(null);
          setInscriptionStatus(null);
          setInscriptionMessage("");
        }, 2000);
      } else {
        setInscriptionStatus({
          success: false,
          message: data.message || "Erreur lors de l'inscription",
        });
      }
    } catch (error) {
      console.error("Erreur inscription:", error);
      setInscriptionStatus({
        success: false,
        message: "Erreur de connexion au serveur",
      });
    } finally {
      setInscriptionLoading(null);
    }
  };

  const filteredFormations = getFilteredFormations();

  const getStatutBadge = (formationId, statut) => {
    if (hasDemandeEnCours(formationId)) {
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
          <ClockIcon size={12} /> Demande envoyée
        </span>
      );
    }
    if (hasDemandeRefusee(formationId)) {
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
          <XCircle size={12} /> Refusée
        </span>
      );
    }
    switch (statut) {
      case "ongoing":
        return (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            En cours
          </span>
        );
      case "available":
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Disponible
          </span>
        );
      case "completed":
        return (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            Terminée
          </span>
        );
      default:
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Disponible
          </span>
        );
    }
  };

  const getActionButton = (formation) => {
    if (hasDemandeEnCours(formation.id)) {
      return (
        <div className="flex items-center gap-2 text-sm text-yellow-600">
          <ClockIcon size={14} className="animate-pulse" />
          <span>En attente de validation</span>
        </div>
      );
    }

    if (hasDemandeRefusee(formation.id)) {
      return (
        <button
          onClick={() => handleReinscrire(formation)}
          disabled={inscriptionLoading === formation.id}
          className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          {inscriptionLoading === formation.id ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <RefreshCw size={14} /> Renvoyer la demande
            </>
          )}
        </button>
      );
    }

    if (formation.statut === "ongoing") {
      return (
        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <Play size={14} /> Continuer
        </button>
      );
    } else if (formation.statut === "available") {
      return (
        <button
          onClick={() => setShowInscriptionModal(formation)}
          disabled={inscriptionLoading === formation.id}
          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
        >
          {inscriptionLoading === formation.id ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "S'inscrire"
          )}
        </button>
      );
    } else {
      return (
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-600 font-medium">
          <FileText size={14} /> Revoir
        </button>
      );
    }
  };

  // Compter les demandes en attente et refusées
  const demandesEnAttente = mesInscriptions.filter(
    (i) => i.statut === "en_attente",
  ).length;
  const demandesRefusees = mesInscriptions.filter(
    (i) => i.statut === "refusee",
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            Catalogue de formations
          </h1>
        </div>
      </div>

      <main className="p-6">
        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterType === "all"
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={{ backgroundColor: filterType === "all" ? "#2b5ea7" : "" }}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilterType("available")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterType === "available"
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={{
              backgroundColor: filterType === "available" ? "#2b5ea7" : "",
            }}
          >
            Disponibles
          </button>
          <button
            onClick={() => setFilterType("mes_demandes")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              filterType === "mes_demandes"
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={{
              backgroundColor: filterType === "mes_demandes" ? "#2b5ea7" : "",
            }}
          >
            <Send size={14} />
            Mes demandes
            {demandesEnAttente > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {demandesEnAttente}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterType("refusees")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              filterType === "refusees"
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={{
              backgroundColor: filterType === "refusees" ? "#ef4444" : "",
            }}
          >
            <XCircle size={14} />
            Refusées
            {demandesRefusees > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {demandesRefusees}
              </span>
            )}
          </button>
        </div>

        {/* Grille des formations */}
        {filteredFormations.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">
              {filterType === "mes_demandes"
                ? "Aucune demande en attente"
                : filterType === "available"
                  ? "Aucune formation disponible pour le moment"
                  : filterType === "refusees"
                    ? "Aucune demande refusée"
                    : "Aucune formation trouvée"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFormations.map((formation) => (
              <div
                key={formation.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {formation.categorie}
                    </span>
                    {getStatutBadge(formation.id, formation.statut)}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {formation.titre}
                  </h3>
                  {formation.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {formation.description}
                    </p>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formation.duree}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{formation.inscrits} inscrits</span>
                    </div>
                  </div>

                  {formation.placesDisponibles > 0 &&
                    !hasDemandeEnCours(formation.id) &&
                    !hasDemandeRefusee(formation.id) && (
                      <div className="text-xs text-gray-500">
                        📍 {formation.placesDisponibles} places disponibles
                      </div>
                    )}

                  {/* Afficher le motif du refus si disponible */}
                  {hasDemandeRefusee(formation.id) &&
                    (() => {
                      const refus = mesInscriptions.find(
                        (i) =>
                          i.formationId === formation.id &&
                          i.statut === "refusee",
                      );
                      return (
                        refus?.messageAdmin && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg">
                            <p className="text-xs text-red-600">Motif :</p>
                            <p className="text-xs text-red-700">
                              {refus.messageAdmin}
                            </p>
                          </div>
                        )
                      );
                    })()}
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                  {getActionButton(formation)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal d'inscription */}
      {showInscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Demande d'inscription
              </h3>
              <button
                onClick={() => {
                  setShowInscriptionModal(null);
                  setInscriptionStatus(null);
                  setInscriptionMessage("");
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            {inscriptionStatus ? (
              <div
                className={`p-4 rounded-lg ${inscriptionStatus.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                <div className="flex items-center gap-2">
                  {inscriptionStatus.success ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  <p>{inscriptionStatus.message}</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Vous souhaitez vous inscrire à la formation :<br />
                  <strong>{showInscriptionModal.titre}</strong>
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={inscriptionMessage}
                    onChange={(e) => setInscriptionMessage(e.target.value)}
                    placeholder="Ajoutez un message à l'administrateur..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleInscription(showInscriptionModal)}
                    disabled={inscriptionLoading === showInscriptionModal.id}
                    className="flex-1 py-2 bg-[#2b5ea7] text-white rounded-lg hover:bg-[#1e4a8a] transition-colors disabled:opacity-50"
                  >
                    {inscriptionLoading === showInscriptionModal.id ? (
                      <Loader2 size={18} className="animate-spin mx-auto" />
                    ) : (
                      "Envoyer la demande"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowInscriptionModal(null);
                      setInscriptionMessage("");
                    }}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprenantFormations;