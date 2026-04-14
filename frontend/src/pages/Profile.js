import React, { useRef, useState, useEffect } from 'react';
import { User, Calendar, Info, Upload, X, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUser } from '../components/context/UserContext';

const ProfileForm = () => {
  const { currentUser, updateCurrentUser } = useUser();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    prenom: "", nom: "", dateNaissance: "", sexe: "",
    email: "", telephone: "", adresse: "", avatar: null
  });
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      const source = (currentUser && Object.keys(currentUser).length > 0) 
        ? currentUser 
        : JSON.parse(localStorage.getItem('currentUser'));

      if (source) {
        setFormData({
          prenom: source.prenom || "",
          nom: source.nom || "",
          dateNaissance: source.dateNaissance || "",
          sexe: source.sexe || "",
          email: source.email || "",
          telephone: source.telephone || "",
          adresse: source.adresse || "",
          avatar: source.avatar || null
        });
        setAvatarPreview(source.avatar || null);
      }
    };
    loadUserData();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const processAvatarFile = async (file) => {
    if (!file.type.startsWith('image/')) return setError("Image invalide");
    if (file.size > 2 * 1024 * 1024) return setError("L'image est trop lourde (> 2MB)");

    const reader = new FileReader();
    reader.onloadstart = () => setUploadProgress(10);
    reader.onloadend = async () => {
      const base64String = reader.result;
      setAvatarPreview(base64String);
      setFormData(prev => ({ ...prev, avatar: base64String }));
      
      const savedUser = JSON.parse(localStorage.getItem('currentUser')) || currentUser;
      if (updateCurrentUser && savedUser) {
        await updateCurrentUser({ ...savedUser, avatar: base64String });
      }
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const savedUser = JSON.parse(localStorage.getItem('currentUser')) || currentUser;
      const updatedData = { ...savedUser, ...formData };
      
      if (updateCurrentUser) await updateCurrentUser(updatedData);
      localStorage.setItem('currentUser', JSON.stringify(updatedData));
      
      setSuccessMessage("Profil mis à jour avec succès");
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedData }));

      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError("Erreur de sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Messages d'alerte flottants */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        {successMessage && (
          <div className="flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-full">
            <CheckCircle2 size={20} />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-full">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Colonne Gauche : Card de Profil Rapide */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-3xl overflow-hidden ring-4 ring-slate-50 shadow-inner group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover transition group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={64} />
                  </div>
                )}
                {/* Overlay de chargement */}
                {uploadProgress > 0 && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                   </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-[#0055a2] text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
              >
                <Upload size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 capitalize">
              {formData.prenom || 'Prénom'} {formData.nom || 'Nom'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">{formData.email || 'Email non renseigné'}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-slate-50">
               <span className="px-4 py-1.5 bg-blue-50 text-[#0055a2] text-xs font-bold uppercase tracking-wider rounded-full">
                  {currentUser?.role || 'Utilisateur'}
               </span>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Formulaire détaillé */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Paramètres du profil</h2>
                <p className="text-slate-500 text-sm">Gérez vos informations personnelles et vos coordonnées</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Group */}
              {[
                { label: 'Prénom', name: 'prenom', icon: User, placeholder: 'Ahmed' },
                { label: 'Nom', name: 'nom', icon: User, placeholder: 'BENALI' },
                { label: 'Email', name: 'email', icon: Mail, placeholder: 'exemple@poste.dz', type: 'email' },
                { label: 'Téléphone', name: 'telephone', icon: Phone, placeholder: '05XXXXXXXX' },
                { label: 'Date de Naissance', name: 'dateNaissance', icon: Calendar, type: 'date' },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-2">
                    <field.icon size={14} /> {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:border-[#0055a2] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              ))}

              {/* Sexe Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-2">
                  <Info size={14} /> Sexe
                </label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:border-[#0055a2] outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              {/* Adresse full width */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-2">
                  <MapPin size={14} /> Adresse Résidentielle
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Rue, Ville, Code Postal"
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:border-[#0055a2] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex items-center gap-3 px-10 py-4 bg-[#0055a2] text-white font-bold rounded-2xl hover:bg-[#004080] hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Enregistrer les modifications
                    <CheckCircle2 size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => processAvatarFile(e.target.files[0])}
      />
    </div>
  );
};

export default ProfileForm;