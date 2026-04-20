// ProfileForm.jsx - Version avec meilleure optimisation d'image
import React, { useRef, useState, useEffect } from 'react';
import { User, Calendar, Info, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Camera, ShieldCheck, Save, Trash2 } from 'lucide-react';
import { useUser } from '../components/context/UserContext';
import axios from 'axios';

const ProfileForm = () => {
  const { currentUser, updateCurrentUser } = useUser();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    prenom: "", nom: "", dateNaissance: "", sexe: "",
    email: "", telephone: "", adresse: "", avatar: null
  });
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    if (currentUser) {
      // Vérifier si l'avatar est une URL ou du base64
      let avatarUrl = currentUser.avatar;
      if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('http')) {
        avatarUrl = null;
      }
      
      setFormData({
        prenom: currentUser.prenom || "",
        nom: currentUser.nom || "",
        dateNaissance: currentUser.dateNaissance ? currentUser.dateNaissance.split('T')[0] : "",
        sexe: currentUser.sexe || "",
        email: currentUser.email || "",
        telephone: currentUser.telephone || "",
        adresse: currentUser.adresse || "",
        avatar: avatarUrl
      });
      setAvatarPreview(avatarUrl);
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // Fonction pour compresser l'image
  const compressImage = (base64String, maxWidth = 150, maxHeight = 150, quality = 0.6) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculer les nouvelles dimensions
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
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en JPEG avec qualité réduite
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = reject;
    });
  };

  const processAvatarFile = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError("Format d'image invalide. Utilisez JPG ou PNG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 2MB");
      return;
    }

    setUploadProgress(20);
    setError("");
    
    try {
      // Lire le fichier
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        setUploadProgress(50);
        const originalBase64 = reader.result;
        
        // Compresser l'image (150x150 max, qualité 0.5)
        const compressedImage = await compressImage(originalBase64, 150, 150, 0.5);
        setUploadProgress(80);
        
        console.log("✅ Image compressée:", {
          original: (originalBase64.length / 1024).toFixed(2) + " KB",
          compressed: (compressedImage.length / 1024).toFixed(2) + " KB"
        });
        
        setAvatarPreview(compressedImage);
        setFormData(prev => ({ ...prev, avatar: compressedImage }));
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
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
    setFormData(prev => ({ ...prev, avatar: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        dateNaissance: formData.dateNaissance || null,
        sexe: formData.sexe || null,
        avatar: formData.avatar
      };
      
      console.log("📤 Envoi mise à jour - taille avatar:", 
        updateData.avatar ? (updateData.avatar.length / 1024).toFixed(2) + " KB" : "null");
      
      let updatedUserData = null;
      
      if (token) {
        const response = await axios.put(`${API_URL}/users/profile`, updateData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        if (response.data.success) {
          updatedUserData = response.data.data;
          console.log("✅ Mise à jour API réussie");
        }
      }
      
      if (!updatedUserData) {
        updatedUserData = {
          ...currentUser,
          ...updateData,
          updatedAt: new Date().toISOString()
        };
      }
      
      await updateCurrentUser(updatedUserData);
      
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUserData }));
      window.dispatchEvent(new CustomEvent('refreshUsers'));
      
      setSuccessMessage("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMessage(""), 4000);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.response?.data?.message || err.message || "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  // Composant Avatar pour l'affichage
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

  if (!currentUser) {
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
          <div className="flex items-center gap-3 bg-white border-l-4 border-emerald-500 text-slate-800 px-6 py-4 rounded-xl shadow-2xl">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-white border-l-4 border-red-500 text-slate-800 px-6 py-4 rounded-xl shadow-2xl">
            <AlertCircle size={18} className="text-red-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">Mon Profil</h1>
          <p className="text-slate-500 mt-2">Personnalisez votre identité sur la plateforme AP Learning</p>
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
                        <p className="text-white text-xs font-bold">{uploadProgress}%</p>
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
                      {currentUser?.role === 'formateur' ? 'Formateur' : 
                       currentUser?.role === 'admin' ? 'Administrateur' : 'Apprenant'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {formData.prenom} {formData.nom}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">{formData.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-400">Statut</p>
                    <p className="text-sm font-bold text-emerald-600">
                      {currentUser?.isActive !== false ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-400">ID</p>
                    <p className="text-sm font-bold text-slate-700 font-mono">
                      #{String(currentUser?._id || currentUser?.id || '').slice(-6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Info size={20} className="text-[#0055a2]" />
                Informations Personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Prénom</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nom</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0055a2] outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Date de Naissance</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Genre</label>
                  <div className="relative">
                    <Info size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Adresse</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                      <Save size={18} />
                      Mettre à jour
                    </>
                  )}
                </button>
              </div>
            </form>
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

export default ProfileForm;