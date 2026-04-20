// frontend/src/pages/ApprenantCahierSuivi.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Target,
  Activity,
  MessageSquare,
  TrendingUp,
  Calendar,
  BookOpen,
  Edit2,
} from "lucide-react";

const ApprenantCahierSuivi = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [currentSuivi, setCurrentSuivi] = useState(null);
  const [semaine, setSemaine] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [entrees, setEntrees] = useState([]);
  const [totalSemainesFormation, setTotalSemainesFormation] = useState(0);

  // Formulaire
  const [formData, setFormData] = useState({
    objectifs: "",
    activitesRealisees: "",
    difficultes: "",
    suggestions: "",
  });

  // Récupérer l'utilisateur
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Récupérer les formations inscrites
  useEffect(() => {
    if (currentUser) {
      fetchInscriptions();
    }
  }, [currentUser]);

  const fetchInscriptions = async () => {
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
          const confirmees = data.data.filter(
            (insc) => insc.statut === "confirmee",
          );

          const formationsRes = await fetch(
            "http://localhost:5000/api/formations",
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            },
          );

          let formationsData = [];
          if (formationsRes.ok) {
            const fData = await formationsRes.json();
            if (fData.success && fData.data) {
              formationsData = fData.data;
            }
          }

          const formationsWithDetails = confirmees.map((insc) => {
            const formation = formationsData.find(
              (f) => f._id === insc.formationId,
            );
            // Calculer le nombre total de semaines de la formation (ex: 6 mois = 24 semaines)
            let totalSemaines = 0;
            if (formation?.duree) {
              const dureeMatch = formation.duree.match(/(\d+)/);
              if (dureeMatch) {
                const dureeNombre = parseInt(dureeMatch[1]);
                totalSemaines = dureeNombre * 4; // Convertir mois en semaines
              }
            }
            return {
              id: insc.formationId,
              titre: insc.formationTitre,
              domaine: insc.formationDomaine,
              dateDebut: formation?.dateDebut,
              duree: formation?.duree,
              totalSemaines: totalSemaines || 12, // Par défaut 12 semaines
            };
          });

          setFormations(formationsWithDetails);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger le cahier de suivi pour une formation
  const loadCahierSuivi = async (formationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/cahier-suivi/apprenant/${formationId}`,
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
          setEntrees(data.data);
          // Trouver l'entrée pour la semaine actuelle
          const suivi = data.data.find((s) => s.semaine === semaine);
          setCurrentSuivi(suivi || null);
        }
      }

      // Charger les statistiques
      const statsRes = await fetch(
        `http://localhost:5000/api/cahier-suivi/stats/${formationId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
    }
  };

  const handleSelectFormation = (formation) => {
    setSelectedFormation(formation);
    setTotalSemainesFormation(formation.totalSemaines);
    setSemaine(1);
    setIsEditing(false);
    setEntrees([]);
    loadCahierSuivi(formation.id);
  };

  // Calculer la progression automatique basée sur les semaines complétées
  const calculerProgressionGlobale = () => {
    if (totalSemainesFormation === 0) return 0;
    const semainesCompletees = entrees.filter(
      (e) => e && e.objectifs && e.objectifs.trim() !== "",
    ).length;
    return Math.round((semainesCompletees / totalSemainesFormation) * 100);
  };

  // Calculer la progression pour la semaine actuelle (basée sur les champs remplis)
  const calculerProgressionSemaine = () => {
    let progression = 0;
    if (formData.objectifs && formData.objectifs.trim() !== "")
      progression += 25;
    if (
      formData.activitesRealisees &&
      formData.activitesRealisees.trim() !== ""
    )
      progression += 25;
    if (formData.difficultes && formData.difficultes.trim() !== "")
      progression += 25;
    if (formData.suggestions && formData.suggestions.trim() !== "")
      progression += 25;
    return progression;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedFormation) return;

    setSaving(true);
    setMessage(null);

    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 6);

    const progressionSemaine = calculerProgressionSemaine();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/cahier-suivi/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            formationId: selectedFormation.id,
            formationTitre: selectedFormation.titre,
            semaine: semaine,
            dateDebut: dateDebut.toISOString(),
            dateFin: dateFin.toISOString(),
            objectifs: formData.objectifs,
            activitesRealisees: formData.activitesRealisees,
            difficultes: formData.difficultes,
            suggestions: formData.suggestions,
            progression: progressionSemaine,
          }),
        },
      );

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Cahier de suivi enregistré avec succès !",
        });

        // Réinitialiser le formulaire
        setFormData({
          objectifs: "",
          activitesRealisees: "",
          difficultes: "",
          suggestions: "",
        });

        // Recharger les données
        await loadCahierSuivi(selectedFormation.id);
        setIsEditing(false);

        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.message || "Erreur lors de l'enregistrement",
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({ type: "error", text: "Erreur de connexion" });
    } finally {
      setSaving(false);
    }
  };

  const handleSemaineChange = async (direction) => {
    const newSemaine = semaine + direction;
    if (newSemaine >= 1 && newSemaine <= totalSemainesFormation) {
      setSemaine(newSemaine);
      setIsEditing(false);
      // Trouver l'entrée pour la nouvelle semaine
      const suivi = entrees.find((s) => s.semaine === newSemaine);
      setCurrentSuivi(suivi || null);
      if (suivi) {
        setFormData({
          objectifs: suivi.objectifs || "",
          activitesRealisees: suivi.activitesRealisees || "",
          difficultes: suivi.difficultes || "",
          suggestions: suivi.suggestions || "",
        });
      } else {
        setFormData({
          objectifs: "",
          activitesRealisees: "",
          difficultes: "",
          suggestions: "",
        });
      }
    }
  };

  const handleEdit = () => {
    if (currentSuivi) {
      setFormData({
        objectifs: currentSuivi.objectifs || "",
        activitesRealisees: currentSuivi.activitesRealisees || "",
        difficultes: currentSuivi.difficultes || "",
        suggestions: currentSuivi.suggestions || "",
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentSuivi) {
      setFormData({
        objectifs: currentSuivi.objectifs || "",
        activitesRealisees: currentSuivi.activitesRealisees || "",
        difficultes: currentSuivi.difficultes || "",
        suggestions: currentSuivi.suggestions || "",
      });
    } else {
      setFormData({
        objectifs: "",
        activitesRealisees: "",
        difficultes: "",
        suggestions: "",
      });
    }
  };

  const handleBack = () => {
    navigate("/apprenant");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progressionGlobale = calculerProgressionGlobale();
  const progressionSemaine = calculerProgressionSemaine();
  const semainesCompletees = entrees.filter(
    (e) => e && e.objectifs && e.objectifs.trim() !== "",
  ).length;

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
          <h1 className="text-xl font-bold text-gray-800">Cahier de suivi</h1>
        </div>
      </div>

      <main className="p-6">
        {!selectedFormation ? (
          // Sélection de la formation
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Mes formations
            </h2>
            {formations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Aucune formation inscrite</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {formations.map((formation) => (
                  <div
                    key={formation.id}
                    onClick={() => handleSelectFormation(formation)}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {formation.domaine}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      {formation.titre}
                    </h3>
                    {formation.dateDebut && (
                      <p className="text-sm text-gray-500">
                        📅 Début :{" "}
                        {new Date(formation.dateDebut).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      📊 Durée : {formation.duree} ({formation.totalSemaines}{" "}
                      semaines)
                    </p>
                    <button className="mt-4 w-full py-2 bg-[#2b5ea7] text-white rounded-lg hover:bg-[#1e4a8a] transition-colors text-sm font-medium">
                      Remplir mon cahier de suivi
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* En-tête formation */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedFormation.titre}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedFormation.domaine}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📊 {selectedFormation.totalSemaines} semaines au total
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFormation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕ Changer
                </button>
              </div>

              {/* Barre de progression globale */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#2b5ea7]" />
                    Progression globale de la formation
                  </p>
                  <span className="text-sm font-bold text-[#2b5ea7]">
                    {progressionGlobale}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${progressionGlobale}%`,
                      backgroundColor: "#2b5ea7",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {semainesCompletees} semaine(s) complétée(s) sur{" "}
                  {selectedFormation.totalSemaines}
                </p>
              </div>
            </div>

            {/* Navigation semaine */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => handleSemaineChange(-1)}
                disabled={semaine === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-center">
                <span className="text-lg font-semibold text-gray-700">
                  Semaine {semaine} / {totalSemainesFormation}
                </span>
                {currentSuivi && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Complété
                  </span>
                )}
              </div>
              <button
                onClick={() => handleSemaineChange(1)}
                disabled={semaine === totalSemainesFormation}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {message.text}
              </div>
            )}

            {/* Carte d'affichage */}
            {currentSuivi && !isEditing && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-green-50 to-white p-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        Semaine {semaine}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {currentSuivi.dateDebut
                          ? new Date(
                              currentSuivi.dateDebut,
                            ).toLocaleDateString()
                          : ""}{" "}
                        -{" "}
                        {currentSuivi.dateFin
                          ? new Date(currentSuivi.dateFin).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <button
                      onClick={handleEdit}
                      className="px-3 py-1.5 bg-[#2b5ea7] text-white rounded-lg hover:bg-[#1e4a8a] transition-colors text-sm flex items-center gap-1"
                    >
                      <Edit2 size={14} /> Modifier
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
                        <Target size={16} /> Objectifs
                      </p>
                      <p className="text-gray-700 mt-1">
                        {currentSuivi.objectifs || "Non renseigné"}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-700 flex items-center gap-2">
                        <Activity size={16} /> Activités réalisées
                      </p>
                      <p className="text-gray-700 mt-1">
                        {currentSuivi.activitesRealisees || "Non renseigné"}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                        <AlertCircle size={16} /> Difficultés
                      </p>
                      <p className="text-gray-700 mt-1">
                        {currentSuivi.difficultes || "Non renseigné"}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                        <MessageSquare size={16} /> Suggestions
                      </p>
                      <p className="text-gray-700 mt-1">
                        {currentSuivi.suggestions || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#2b5ea7]" />{" "}
                      Progression de la semaine
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${currentSuivi.progression || 0}%`,
                          backgroundColor: "#2b5ea7",
                        }}
                      />
                    </div>
                    <p className="text-right text-sm text-gray-600 mt-1">
                      {currentSuivi.progression || 0}%
                    </p>
                  </div>
                  {currentSuivi.commentaireFormateur && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-orange-700 flex items-center gap-2">
                        <MessageSquare size={16} /> Commentaire du formateur
                      </p>
                      <p className="text-sm text-orange-600 mt-1">
                        {currentSuivi.commentaireFormateur}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formulaire d'ajout/modification */}
            {(!currentSuivi || isEditing) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#2b5ea7] to-[#1e4a8a] p-4">
                  <h3 className="font-bold text-white">
                    {currentSuivi
                      ? "Modifier mon cahier de suivi"
                      : "Ajouter mon cahier de suivi"}{" "}
                    - Semaine {semaine}
                  </h3>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Target size={16} className="text-[#2b5ea7]" />
                      Objectifs de la semaine
                    </label>
                    <textarea
                      value={formData.objectifs}
                      onChange={(e) =>
                        handleInputChange("objectifs", e.target.value)
                      }
                      rows="3"
                      placeholder="Quels sont vos objectifs pour cette semaine ?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Activity size={16} className="text-[#2b5ea7]" />
                      Activités réalisées
                    </label>
                    <textarea
                      value={formData.activitesRealisees}
                      onChange={(e) =>
                        handleInputChange("activitesRealisees", e.target.value)
                      }
                      rows="3"
                      placeholder="Décrivez les activités que vous avez réalisées cette semaine..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <AlertCircle size={16} className="text-[#2b5ea7]" />
                      Difficultés rencontrées
                    </label>
                    <textarea
                      value={formData.difficultes}
                      onChange={(e) =>
                        handleInputChange("difficultes", e.target.value)
                      }
                      rows="2"
                      placeholder="Avez-vous rencontré des difficultés ?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#2b5ea7]" />
                      Suggestions
                    </label>
                    <textarea
                      value={formData.suggestions}
                      onChange={(e) =>
                        handleInputChange("suggestions", e.target.value)
                      }
                      rows="2"
                      placeholder="Avez-vous des suggestions pour améliorer la formation ?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#2b5ea7]" />
                      Progression de la semaine (calculée automatiquement)
                    </label>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${progressionSemaine}%`,
                          backgroundColor: "#2b5ea7",
                        }}
                      />
                    </div>
                    <p className="text-right text-sm text-gray-600 mt-1">
                      {progressionSemaine}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      * Basée sur les champs remplis (25% par champ)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {isEditing && (
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Annuler
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`${isEditing ? "flex-1" : "w-full"} py-3 bg-[#2b5ea7] text-white rounded-lg hover:bg-[#1e4a8a] transition-colors font-medium flex items-center justify-center gap-2`}
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <>
                          <Save size={18} />{" "}
                          {currentSuivi ? "Mettre à jour" : "Enregistrer"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ApprenantCahierSuivi;
