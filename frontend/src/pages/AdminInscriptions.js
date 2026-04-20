// frontend/src/pages/AdminInscriptions.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
// ❌ SUPPRIME CET IMPORT - Le Layout est déjà géré par App.js
// import Layout from "../components/Layout/Layout";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Loader2,
  Mail,
  Calendar,
  BookOpen,
  UserCheck,
} from "lucide-react";

const AdminInscriptions = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [inscriptions, setInscriptions] = useState([]);
  const [filteredInscriptions, setFilteredInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseStatut, setResponseStatut] = useState("confirmee");
  const [processing, setProcessing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Vérification d'authentification dans useEffect
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      if (userData.role !== "admin") {
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      navigate("/login");
    }
  }, [navigate]);

  // Récupérer les inscriptions
  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      console.log("🔄 Chargement des inscriptions...");

      const response = await fetch(
        "http://localhost:5000/api/formations/admin/inscriptions",
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
        console.log("✅ Inscriptions reçues:", data);

        if (data.success && data.data) {
          setInscriptions(data.data);
          setFilteredInscriptions(data.data);
        } else {
          setInscriptions([]);
          setFilteredInscriptions([]);
        }
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Erreur lors du chargement des inscriptions",
        );
        setInscriptions([]);
        setFilteredInscriptions([]);
      }
    } catch (error) {
      console.error("❌ Erreur chargement inscriptions:", error);
      setError("Erreur de connexion au serveur");
      setInscriptions([]);
      setFilteredInscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les inscriptions
  useEffect(() => {
    let filtered = inscriptions;

    if (searchTerm) {
      filtered = filtered.filter(
        (insc) =>
          insc.formationTitre
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          insc.apprenantId?.nom
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          insc.apprenantId?.prenom
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          insc.apprenantId?.matricule
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (filterStatut !== "all") {
      filtered = filtered.filter((insc) => insc.statut === filterStatut);
    }

    setFilteredInscriptions(filtered);
  }, [searchTerm, filterStatut, inscriptions]);

  const getStatutBadge = (statut) => {
    switch (statut) {
      case "en_attente":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock size={12} /> En attente
          </span>
        );
      case "confirmee":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={12} /> Confirmée
          </span>
        );
      case "refusee":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={12} /> Refusée
          </span>
        );
      case "annulee":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <XCircle size={12} /> Annulée
          </span>
        );
      default:
        return null;
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "en_attente":
        return "border-yellow-500 bg-yellow-50";
      case "confirmee":
        return "border-green-500 bg-green-50";
      case "refusee":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const handleRespond = async () => {
    if (!selectedInscription) return;

    setProcessing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/formations/inscription/${selectedInscription._id}/repondre`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            statut: responseStatut,
            message: responseMessage,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert(
          `✅ Inscription ${responseStatut === "confirmee" ? "acceptée" : "refusée"} avec succès`,
        );
        setShowResponseModal(false);
        setSelectedInscription(null);
        setResponseMessage("");
        fetchInscriptions();
      } else {
        alert(`❌ Erreur: ${data.message || "Une erreur est survenue"}`);
      }
    } catch (error) {
      console.error("Erreur réponse inscription:", error);
      alert("❌ Erreur de connexion au serveur");
    } finally {
      setProcessing(false);
    }
  };

  const openResponseModal = (inscription) => {
    setSelectedInscription(inscription);
    setResponseStatut("confirmee");
    setResponseMessage("");
    setShowResponseModal(true);
  };

  const openDetailsModal = (inscription) => {
    setSelectedInscription(inscription);
    setShowDetailsModal(true);
  };

  const getStats = () => {
    const total = inscriptions.length;
    const enAttente = inscriptions.filter(
      (i) => i.statut === "en_attente",
    ).length;
    const confirmees = inscriptions.filter(
      (i) => i.statut === "confirmee",
    ).length;
    const refusees = inscriptions.filter((i) => i.statut === "refusee").length;
    return { total, enAttente, confirmees, refusees };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-[#2b5ea7]" />
          Gestion des inscriptions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Gérez les demandes d'inscription aux formations
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.enAttente}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmées</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.confirmees}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Refusées</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.refusees}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmées</option>
              <option value="refusee">Refusées</option>
              <option value="annulee">Annulées</option>
            </select>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Liste des inscriptions */}
      {filteredInscriptions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Aucune demande d'inscription trouvée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInscriptions.map((inscription) => (
            <div
              key={inscription._id}
              className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden hover:shadow-md transition-shadow ${getStatutColor(inscription.statut)}`}
            >
              <div className="p-5">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-lg text-gray-800">
                        {inscription.formationTitre}
                      </h3>
                      {getStatutBadge(inscription.statut)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserCheck size={16} className="text-[#2b5ea7]" />
                        <span>
                          {inscription.apprenantId?.prenom}{" "}
                          {inscription.apprenantId?.nom}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-[#2b5ea7]" />
                        <span>{inscription.apprenantId?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen size={16} className="text-[#2b5ea7]" />
                        <span>{inscription.formationDomaine}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-[#2b5ea7]" />
                        <span>
                          Demandé le{" "}
                          {new Date(
                            inscription.demandeEnvoyeeLe,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {inscription.messageApprenant && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">
                          Message de l'apprenant :
                        </p>
                        <p className="text-sm text-gray-700">
                          {inscription.messageApprenant}
                        </p>
                      </div>
                    )}

                    {inscription.messageAdmin && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 mb-1">
                          Réponse de l'admin :
                        </p>
                        <p className="text-sm text-blue-700">
                          {inscription.messageAdmin}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailsModal(inscription)}
                      className="p-2 text-gray-500 hover:text-[#2b5ea7] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye size={18} />
                    </button>

                    {inscription.statut === "en_attente" && (
                      <button
                        onClick={() => openResponseModal(inscription)}
                        className="px-4 py-2 bg-[#2b5ea7] text-white rounded-lg hover:bg-[#1e4a8a] transition-colors text-sm font-medium"
                      >
                        Traiter la demande
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals (garde les mêmes) */}
      {showResponseModal && selectedInscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Traiter la demande d'inscription
              </h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Formation :</strong>{" "}
                {selectedInscription.formationTitre}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Apprenant :</strong>{" "}
                {selectedInscription.apprenantId?.prenom}{" "}
                {selectedInscription.apprenantId?.nom}
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Décision
              </label>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setResponseStatut("confirmee")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    responseStatut === "confirmee"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <CheckCircle size={16} className="inline mr-2" />
                  Accepter
                </button>
                <button
                  onClick={() => setResponseStatut("refusee")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    responseStatut === "refusee"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <XCircle size={16} className="inline mr-2" />
                  Refuser
                </button>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Ajoutez un message pour l'apprenant..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRespond}
                disabled={processing}
                className="flex-1 py-2 bg-[#2b5ea7] text-white rounded-lg hover:bg-[#1e4a8a] transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 size={18} className="animate-spin mx-auto" />
                ) : (
                  "Confirmer"
                )}
              </button>
              <button
                onClick={() => setShowResponseModal(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails */}
      {showDetailsModal && selectedInscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Détails de la demande
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Formation</h4>
                <p className="text-gray-600">
                  {selectedInscription.formationTitre}
                </p>
                <p className="text-sm text-gray-500">
                  Domaine : {selectedInscription.formationDomaine}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Apprenant</h4>
                <p className="text-gray-600">
                  {selectedInscription.apprenantId?.prenom}{" "}
                  {selectedInscription.apprenantId?.nom}
                </p>
                <p className="text-sm text-gray-500">
                  Matricule : {selectedInscription.apprenantId?.matricule}
                </p>
                <p className="text-sm text-gray-500">
                  Email : {selectedInscription.apprenantId?.email}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Demande</h4>
                <p className="text-sm text-gray-600">
                  Date :{" "}
                  {new Date(
                    selectedInscription.demandeEnvoyeeLe,
                  ).toLocaleString()}
                </p>
                {selectedInscription.messageApprenant && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Message :</p>
                    <p className="text-sm text-gray-700">
                      {selectedInscription.messageApprenant}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Statut</h4>
                {getStatutBadge(selectedInscription.statut)}
                {selectedInscription.reponseLe && (
                  <p className="text-xs text-gray-500 mt-2">
                    Répondu le :{" "}
                    {new Date(selectedInscription.reponseLe).toLocaleString()}
                  </p>
                )}
                {selectedInscription.messageAdmin && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">
                      Message de réponse :
                    </p>
                    <p className="text-sm text-blue-700">
                      {selectedInscription.messageAdmin}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInscriptions;
