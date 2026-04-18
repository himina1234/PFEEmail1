import React, { useRef, useState, useEffect } from 'react';
import { User, Calendar, Info, Upload, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Camera, ShieldCheck } from 'lucide-react';
import { useUser } from '../components/context/UserContext';

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
    if (!file) return;
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
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      
      {/* Notifications */}
      <div className="fixed top-8 right-8 z-50 flex flex-col gap-4">
        {successMessage && (
          <div className="flex items-center gap-3 bg-white border-l-4 border-emerald-500 text-slate-800 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-white border-l-4 border-red-500 text-slate-800 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <AlertCircle size={18} />
            </div>
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Profil</h1>
          <p className="text-slate-500 mt-2">Personnalisez votre identité sur la plateforme AP Learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card Gauche : Avatar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 sticky top-8">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-full p-1.5 border-2 border-dashed border-slate-200 group-hover:border-[#0055a2] transition-colors duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative shadow-inner">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <User size={80} strokeWidth={1} />
                        </div>
                      )}
                      
                      {/* Loading Overlay */}
                      {uploadProgress > 0 && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-10 h-10 border-4 border-slate-100 border-t-[#0055a2] rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-white text-slate-700 p-3 rounded-full shadow-lg border border-slate-100 hover:bg-[#0055a2] hover:text-white transition-all duration-300"
                  >
                    <Camera size={20} />
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full mb-3">
                    <ShieldCheck size={14} className="text-[#0055a2]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {currentUser?.role || 'Membre'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 capitalize leading-tight">
                    {formData.prenom} <br/> {formData.nom}
                  </h2>
                  <p className="text-slate-400 text-sm mt-2 font-medium">{formData.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-10">
                    <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Statut</p>
                        <p className="text-sm font-bold text-emerald-600">Actif</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID</p>
                        <p className="text-sm font-bold text-slate-700">#0422</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire à droite */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200/60">
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-50 text-[#0055a2] rounded-xl flex items-center justify-center">
                    <Info size={18} />
                </span>
                Informations Personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: 'Prénom', name: 'prenom', icon: User, placeholder: 'Ahmed' },
                  { label: 'Nom', name: 'nom', icon: User, placeholder: 'BENALI' },
                  { label: 'Adresse Email', name: 'email', icon: Mail, placeholder: 'exemple@poste.dz', type: 'email' },
                  { label: 'Numéro de téléphone', name: 'telephone', icon: Phone, placeholder: '05XXXXXXXX' },
                  { label: 'Date de Naissance', name: 'dateNaissance', icon: Calendar, type: 'date' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                      {field.label}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0055a2] transition-colors">
                        <field.icon size={18} />
                      </div>
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:bg-white focus:border-[#0055a2] focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Genre</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Info size={18} />
                    </div>
                    <select
                      name="sexe"
                      value={formData.sexe}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:bg-white focus:border-[#0055a2] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Adresse Résidentielle</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <MapPin size={18} />
                    </div>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      placeholder="Rue, Ville, Code Postal"
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:bg-white focus:border-[#0055a2] focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-between p-2 bg-slate-50 rounded-[2rem]">
                <p className="hidden md:block text-slate-400 text-xs px-6 font-medium italic">
                    Dernière modification le {new Date().toLocaleDateString()}
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-10 py-4 bg-[#0055a2] text-white font-bold rounded-3xl hover:bg-[#003d7a] hover:shadow-2xl hover:shadow-blue-200 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Mettre à jour le profil
                      <CheckCircle2 size={20} />
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
        accept="image/*"
        onChange={(e) => processAvatarFile(e.target.files[0])}
      />
    </div>
  );
};

export default ProfileForm;