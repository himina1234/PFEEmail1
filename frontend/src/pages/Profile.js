// src/pages/Profile.js
import React, { useRef, useState, useEffect } from "react";
import {
  User,
  Calendar,
  Info,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Camera,
  ShieldCheck,
  Save,
  Trash2,
  Lock,
  Key,
  Eye,
  EyeOff,
  Building2,
  Clock,
  BadgeCheck,
  Smartphone,
  Home,
  CalendarDays,
  UserCheck,
} from "lucide-react";
import { useUser } from "../components/context/UserContext";
import axios from "axios";

const Profile = () => {
  const { currentUser, updateCurrentUser, refreshUserData } = useUser();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    dateNaissance: "",
    sexe: "",
    telephone: "",
    adresse: "",
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // États pour le changement de mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem("token");

  // Charger le profil depuis le backend
  const loadProfileFromBackend = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return;
      }

      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.data) {
        const user = response.data.data;

        setFormData({
          prenom: user.prenom || "",
          nom: user.nom || "",
          dateNaissance: user.dateNaissance
            ? user.dateNaissance.split("T")[0]
            : "",
          sexe: user.sexe || "",
          telephone: user.telephone || "",
          adresse: user.adresse || "",
          avatar: user.avatar || null,
        });
        setAvatarPreview(user.avatar || null);
        setUserEmail(user.email || "");

        localStorage.setItem("currentUser", JSON.stringify(user));
        await updateCurrentUser(user);
        
        // Émettre un événement pour mettre à jour la Sidebar
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: user }));
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setFormData({
          prenom: user.prenom || "",
          nom: user.nom || "",
          dateNaissance: user.dateNaissance
            ? user.dateNaissance.split("T")[0]
            : "",
          sexe: user.sexe || "",
          telephone: user.telephone || "",
          adresse: user.adresse || "",
          avatar: user.avatar || null,
        });
        setAvatarPreview(user.avatar || null);
        setUserEmail(user.email || "");
      }
    }
  };

  useEffect(() => {
    loadProfileFromBackend();
  }, []);

  useEffect(() => {
    const handleLoginSuccess = () => {
      setTimeout(() => {
        loadProfileFromBackend();
      }, 500);
    };

    const handleProfileUpdated = (event) => {
      if (event.detail) {
        setFormData({
          prenom: event.detail.prenom || "",
          nom: event.detail.nom || "",
          dateNaissance: event.detail.dateNaissance
            ? event.detail.dateNaissance.split("T")[0]
            : "",
          sexe: event.detail.sexe || "",
          telephone: event.detail.telephone || "",
          adresse: event.detail.adresse || "",
          avatar: event.detail.avatar || null,
        });
        setAvatarPreview(event.detail.avatar || null);
        setUserEmail(event.detail.email || "");
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "currentUser" && e.newValue) {
        const user = JSON.parse(e.newValue);
        setFormData({
          prenom: user.prenom || "",
          nom: user.nom || "",
          dateNaissance: user.dateNaissance
            ? user.dateNaissance.split("T")[0]
            : "",
          sexe: user.sexe || "",
          telephone: user.telephone || "",
          adresse: user.adresse || "",
          avatar: user.avatar || null,
        });
        setAvatarPreview(user.avatar || null);
        setUserEmail(user.email || "");
      }
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    window.addEventListener("profileUpdated", handleProfileUpdated);
    window.addEventListener("userDataChanged", handleProfileUpdated);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
      window.removeEventListener("profileUpdated", handleProfileUpdated);
      window.removeEventListener("userDataChanged", handleProfileUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const compressImage = (
    base64String,
    maxWidth = 150,
    maxHeight = 150,
    quality = 0.6,
  ) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.onerror = reject;
    });
  };

  const base64ToFile = (base64, filename) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const uploadAvatarToServer = async (base64Image) => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const file = base64ToFile(base64Image, `avatar_${Date.now()}.jpg`);
      const formDataUpload = new FormData();
      formDataUpload.append("avatar", file);

      const response = await axios.post(
        `${API_URL}/users/upload-avatar`,
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        },
      );

      if (response.data.success && response.data.avatarUrl) {
        return response.data.avatarUrl;
      }
      return null;
    } catch (error) {
      console.error(
        "Erreur upload avatar:",
        error.response?.data || error.message,
      );
      return null;
    }
  };

  const processAvatarFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Format d'image invalide. Utilisez JPG ou PNG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 2MB");
      return;
    }

    setUploadProgress(20);
    setError("");
    setSuccessMessage("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        setUploadProgress(50);
        const originalBase64 = reader.result;

        const compressedImage = await compressImage(
          originalBase64,
          150,
          150,
          0.5,
        );
        setUploadProgress(80);

        const serverAvatarUrl = await uploadAvatarToServer(compressedImage);

        if (serverAvatarUrl) {
          setAvatarPreview(serverAvatarUrl);
          setFormData((prev) => ({ ...prev, avatar: serverAvatarUrl }));
          setSuccessMessage("✅ Photo de profil uploadée avec succès !");
          
          // Mettre à jour le localStorage et le contexte
          const updatedUser = { ...currentUser, avatar: serverAvatarUrl };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          await updateCurrentUser(updatedUser);
          
          // Émettre événement pour Sidebar
          window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: { avatar: serverAvatarUrl } }));
          window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updatedUser }));
        } else {
          setAvatarPreview(compressedImage);
          setFormData((prev) => ({ ...prev, avatar: compressedImage }));
          setSuccessMessage(
            "✅ Photo sélectionnée, n'oubliez pas d'enregistrer !",
          );
        }

        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
        setTimeout(() => setSuccessMessage(""), 3000);
      };

      reader.onerror = () => {
        setError("Erreur lors de la lecture de l'image");
        setUploadProgress(0);
      };
    } catch (err) {
      console.error("Erreur traitement image:", err);
      setError("Erreur lors du traitement de l'image");
      setUploadProgress(0);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFormData((prev) => ({ ...prev, avatar: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSuccessMessage("Photo supprimée, n'oubliez pas d'enregistrer !");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = getAuthToken();

      const updateData = {
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        adresse: formData.adresse,
        dateNaissance: formData.dateNaissance || null,
        sexe: formData.sexe || null,
        avatar: formData.avatar,
      };

      let updatedUserData = null;

      if (token) {
        const response = await axios.put(
          `${API_URL}/users/profile`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          },
        );

        if (response.data.success) {
          updatedUserData = response.data.data;
          console.log("✅ Mise à jour API réussie");
        }
      }

      if (!updatedUserData) {
        updatedUserData = {
          ...currentUser,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
      }

      await updateCurrentUser(updatedUserData);
      localStorage.setItem("currentUser", JSON.stringify(updatedUserData));

      window.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: updatedUserData }),
      );
      window.dispatchEvent(
        new CustomEvent("userDataChanged", { detail: updatedUserData }),
      );
      window.dispatchEvent(
        new CustomEvent("avatarUpdated", {
          detail: { avatar: updatedUserData.avatar },
        }),
      );
      window.dispatchEvent(new Event("storage"));

      if (refreshUserData) {
        await refreshUserData();
      }

      setSuccessMessage("✅ Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la mise à jour",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion du changement de mot de passe
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("Le nouveau mot de passe doit être différent de l'ancien");
      return;
    }

    setIsPasswordLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setPasswordError("Non authentifié");
        return;
      }

      const response = await axios.put(
        `${API_URL}/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPasswordSuccess("✅ Mot de passe modifié avec succès !");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setTimeout(() => setPasswordSuccess(""), 4000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const AvatarImage = ({ src, alt, className }) => {
    const [imgError, setImgError] = useState(false);

    if (!src || imgError) {
      return (
        <div className="w-full h-full flex items-center justify-center text-slate-300">
          <User size={80} strokeWidth={1} />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setImgError(true)}
      />
    );
  };

  if (!currentUser && !localStorage.getItem("currentUser")) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0055a2] mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="fixed top-8 right-8 z-50 flex flex-col gap-4">
        {successMessage && (
          <div className="flex items-center gap-3 bg-white border-l-4 border-emerald-500 text-slate-800 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-white border-l-4 border-red-500 text-slate-800 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="text-red-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
        {passwordSuccess && (
          <div className="flex items-center gap-3 bg-white border-l-4 border-emerald-500 text-slate-800 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="font-semibold">{passwordSuccess}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">Mon Profil</h1>
          <p className="text-slate-500 mt-2">
            Personnalisez votre identité sur la plateforme AP Learning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Avatar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 sticky top-8">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-slate-100">
                    <AvatarImage
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                        <p className="text-white text-xs font-bold">
                          {uploadProgress}%
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute -bottom-2 right-2 flex gap-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#0055a2] text-white p-2 rounded-full shadow-lg hover:bg-[#003d7a] transition-all"
                      title="Changer l'avatar"
                    >
                      <Camera size={16} />
                    </button>
                    {avatarPreview && (
                      <button
                        onClick={removeAvatar}
                        className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all"
                        title="Supprimer l'avatar"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full mb-3">
                    <ShieldCheck size={12} className="text-[#0055a2]" />
                    <span className="text-[10px] font-bold uppercase text-slate-600">
                      {currentUser?.role === "formateur"
                        ? "Formateur"
                        : currentUser?.role === "admin"
                          ? "Administrateur"
                          : "Apprenant"}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {formData.prenom} {formData.nom}
                  </h2>

                  {/* Email non modifiable */}
                  <div className="mt-3 flex items-center justify-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                    <Mail size={14} className="text-[#0055a2]" />
                    <span className="text-sm">{userEmail}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-400">
                      Statut
                    </p>
                    <p className="text-sm font-bold text-emerald-600">
                      {currentUser?.isActive !== false ? "Actif" : "Inactif"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-400">ID</p>
                    <p className="text-sm font-bold text-slate-700 font-mono">
                      #
                      {String(currentUser?._id || currentUser?.id || "").slice(
                        -6,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Info size={20} className="text-[#0055a2]" />
                Informations Personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Prénom
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Nom
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Smartphone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      placeholder="05XXXXXXXX"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Date de Naissance
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      name="dateNaissance"
                      value={formData.dateNaissance}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Genre
                  </label>
                  <div className="relative">
                    <UserCheck
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      name="sexe"
                      value={formData.sexe}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none appearance-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Adresse
                  </label>
                  <div className="relative">
                    <Home
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      placeholder="Rue, Ville, Code Postal"
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-[#0055a2] text-white font-bold rounded-xl hover:bg-[#003d7a] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} /> Mettre à jour
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Formulaire de changement de mot de passe */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mt-8">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Lock size={20} className="text-amber-600" />
                  Sécurité
                </h3>
                <div className={`text-amber-600 transition-transform ${showPasswordForm ? "rotate-180" : ""}`}>
                  ▼
                </div>
              </button>

              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <BadgeCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordError("");
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-4 py-2 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isPasswordLoading}
                      className="px-6 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isPasswordLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Key size={16} /> Changer le mot de passe
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Informations supplémentaires */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 mt-8 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Clock size={20} className="text-[#0055a2]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Dernière connexion</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {currentUser?.lastLogin 
                      ? new Date(currentUser.lastLogin).toLocaleString()
                      : "Première connexion"}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Compte créé le {currentUser?.createdAt 
                      ? new Date(currentUser.createdAt).toLocaleDateString()
                      : "Date inconnue"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/jpg"
        onChange={(e) => processAvatarFile(e.target.files[0])}
      />
    </div>
  );
};

export default Profile;