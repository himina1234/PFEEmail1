// frontend/src/pages/ApprenantPlanning.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  ChevronRight,
  Loader2,
  Play,
} from "lucide-react";

const ApprenantPlanning = () => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Récupérer l'utilisateur
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erreur:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Récupérer les formations et les inscriptions
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, currentWeek]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Récupérer les formations
      const formationsRes = await fetch(
        "http://localhost:5000/api/formations",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      // Récupérer les inscriptions de l'apprenant
      const inscriptionsRes = await fetch(
        "http://localhost:5000/api/formations/mes-inscriptions",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let formations = [];
      if (formationsRes.ok) {
        const data = await formationsRes.json();
        if (data.success && data.data) {
          formations = data.data;
        }
      }

      let inscriptions = [];
      if (inscriptionsRes.ok) {
        const data = await inscriptionsRes.json();
        if (data.success && data.data) {
          // Garder uniquement les inscriptions confirmées
          inscriptions = data.data.filter(
            (insc) => insc.statut === "confirmee",
          );
        }
      }

      // Créer les événements à partir des formations inscrites avec leurs dates réelles
      const eventsList = [];

      inscriptions.forEach((inscription) => {
        // Trouver la formation correspondante
        const formation = formations.find(
          (f) => f._id === inscription.formationId,
        );

        if (formation && formation.dateDebut) {
          const dateDebut = new Date(formation.dateDebut);

          // Vérifier si la formation commence cette semaine
          const startOfWeek = getStartOfWeek(currentWeek);
          const endOfWeek = getEndOfWeek(currentWeek);

          if (dateDebut >= startOfWeek && dateDebut <= endOfWeek) {
            // Déterminer le jour de la semaine (0 = Dimanche)
            const dayIndex = dateDebut.getDay();
            const dayKeys = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

            // Ne garder que du Dimanche au Jeudi
            if (dayIndex >= 0 && dayIndex <= 4) {
              eventsList.push({
                id: inscription._id,
                formationId: inscription.formationId,
                dayKey: dayKeys[dayIndex],
                date: dateDebut,
                time: "09:00 - 16:00",
                title: formation.titre,
                description: formation.description,
                location: formation.wilayas?.[0] || "En ligne",
                duree: formation.duree,
                domaine: formation.domaine,
              });
            }
          }
        }
      });

      setEvents(eventsList);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir le début de la semaine (Dimanche)
  const getStartOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    return new Date(start.setDate(diff));
  };

  // Obtenir la fin de la semaine (Jeudi)
  const getEndOfWeek = (date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 4); // Jeudi
    end.setHours(23, 59, 59, 999);
    return end;
  };

  // Générer les jours de la semaine (DIMANCHE à JEUDI)
  const getWeekDays = (date) => {
    const start = getStartOfWeek(date);
    const weekDays = [];
    const dayKeys = ["dim", "lun", "mar", "mer", "jeu"];
    const dayNames = ["DIM.", "LUN.", "MAR.", "MER.", "JEU."];

    for (let i = 0; i < 5; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + i);

      weekDays.push({
        date: dayDate,
        dayKey: dayKeys[i],
        dayName: dayNames[i],
        dayFullName: dayDate.toLocaleDateString("fr-FR", { weekday: "long" }),
        dayNum: dayDate.getDate(),
        month: dayDate.toLocaleDateString("fr-FR", { month: "short" }),
      });
    }
    return weekDays;
  };

  const weekDays = getWeekDays(currentWeek);

  // Sélectionner le jour courant par défaut
  if (!selectedDay && weekDays.length > 0) {
    const today = new Date();
    const currentDay = weekDays.find(
      (day) => day.date.toDateString() === today.toDateString(),
    );
    setSelectedDay(currentDay || weekDays[0]);
  }

  const getEventsForDay = () => {
    if (!selectedDay) return [];
    return events.filter((event) => event.dayKey === selectedDay.dayKey);
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === "prev" ? -7 : 7));
    setCurrentWeek(newDate);
  };

  const handleBack = () => {
    navigate("/apprenant");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  // Vérifier l'authentification
  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const eventsForDay = getEventsForDay();

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
            Planning des formations
          </h1>
        </div>
      </div>

      <main className="p-6">
        {/* Navigation semaine */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeWeek("prev")}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-700">
            Semaine du {weekDays[0]?.date.toLocaleDateString("fr-FR")} au{" "}
            {weekDays[4]?.date.toLocaleDateString("fr-FR")}
          </h2>
          <button
            onClick={() => changeWeek("next")}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Jours de la semaine (Dimanche à Jeudi) */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {weekDays.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(day)}
              className={`p-2 rounded-lg text-center transition-all ${
                selectedDay?.dayKey === day.dayKey
                  ? "text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
              style={{
                backgroundColor:
                  selectedDay?.dayKey === day.dayKey ? "#2b5ea7" : "",
              }}
            >
              <p className="text-xs font-semibold">{day.dayName}</p>
              <p className="text-lg font-bold">{day.dayNum}</p>
              <p className="text-[10px] opacity-80">{day.month}</p>
            </button>
          ))}
        </div>

        {/* Événements du jour sélectionné */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              {selectedDay?.dayFullName} {selectedDay?.dayNum}{" "}
              {selectedDay?.month}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {eventsForDay.length > 0 ? (
              eventsForDay.map((event, idx) => (
                <div
                  key={event.id || idx}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="min-w-[120px]">
                      <div className="flex items-center gap-1 text-sm font-medium text-[#2b5ea7]">
                        <Calendar size={14} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock size={14} />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {event.domaine || "Formation"}
                        </span>
                        {event.duree && (
                          <span className="text-xs text-gray-400">
                            📅 {event.duree}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 text-base">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/apprenant/formation/${event.formationId}`)
                      }
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90 flex items-center gap-2"
                      style={{ backgroundColor: "#2b5ea7" }}
                    >
                      <Play size={14} /> Commencer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune formation prévue ce jour</p>
                <button
                  onClick={() => navigate("/apprenant/formations")}
                  className="mt-3 text-sm text-[#2b5ea7] hover:underline"
                >
                  Voir les formations disponibles →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApprenantPlanning;
