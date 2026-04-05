import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  FileSpreadsheet, UserPlus, GraduationCap, X, 
  Download, UploadCloud, CheckCircle2, AlertCircle, 
  Info, Loader2, Database, ShieldCheck, Trash2
} from 'lucide-react';

const ImportExcel = ({ onClose, onImportComplete }) => {
  // États de fichiers et données
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  
  // États de l'interface
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userType, setUserType] = useState('user');
  
  // État du formulaire manuel
  const [newUser, setNewUser] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const fileInputRef = useRef(null);

  // Fonction pour réinitialiser complètement l'état
  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    setImportResult(null);
    setProgress(0);
    setCurrentTask("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Important: Réinitialiser l'input file
    }
  };

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      resetState();
    };
  }, []);

  // --- LOGIQUE DE GÉNÉRATION ---
  const generateMatricule = (nom, prenom) => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const prefix = `${year}${nom.substring(0, 2).toUpperCase()}${prenom.substring(0, 2).toUpperCase()}`;
    return `${prefix}${random}`;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    return Array.from({ length: 9 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  // --- FONCTION POUR ASSIGNER LES FORMATEURS AUX APPRENANTS ---
  const assignFormateurToApprenants = (apprenants) => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const formateurs = allUsers.filter(u => u.role === 'formateur');
    
    if (formateurs.length === 0) {
      console.warn("Aucun formateur trouvé. Les apprenants ne seront pas assignés.");
      return apprenants;
    }
    
    return apprenants.map((apprenant, index) => {
      const formateur = formateurs[index % formateurs.length];
      return {
        ...apprenant,
        formateurId: formateur.id,
        formateurNom: formateur.fullName || `${formateur.prenom} ${formateur.nom}`,
        assignedAt: new Date().toISOString()
      };
    });
  };

  // --- FONCTION POUR METTRE À JOUR LA LISTE DES APPRENANTS D'UN FORMATEUR ---
  const updateFormateurApprenantsList = (formateurId, apprenantId) => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    const updatedUsers = allUsers.map(user => {
      if (user.id === formateurId && user.role === 'formateur') {
        const currentApprenants = user.apprenantsIds || [];
        if (!currentApprenants.includes(apprenantId)) {
          return {
            ...user,
            apprenantsIds: [...currentApprenants, apprenantId]
          };
        }
      }
      return user;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // --- TRAITEMENT DES FICHIERS AVEC RÉINITIALISATION ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Réinitialiser les états avant de charger le nouveau fichier
      resetState();
      setFile(selectedFile);
      setError(null);
      parseExcel(selectedFile);
    }
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        const validatedData = jsonData.map(row => ({
          nom: String(row.Nom || row.nom || row.NAME || '').trim(),
          prenom: String(row.Prenom || row.prenom || row.FirstName || '').trim(),
          email: String(row.Email || row.email || '').trim(),
          telephone: String(row.Telephone || row.telephone || row.Phone || '').trim(),
          role: String(row.Role || row.role || 'user').toLowerCase()
        })).filter(u => u.nom && u.prenom);

        if (validatedData.length === 0) {
          setError("Le fichier ne contient aucune donnée valide (colonnes 'nom' et 'prenom' requises).");
          setPreviewData([]);
        } else {
          setPreviewData(validatedData);
        }
      } catch (err) {
        setError("Erreur de lecture du fichier Excel.");
        setPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Fonction pour supprimer le fichier courant
  const clearCurrentFile = () => {
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- LOGIQUE D'IMPORTATION MASSIVE ---
  const executeImport = async (dataArray) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    const total = dataArray.length;
    const chunkSize = 20;
    let allNewUsers = [];

    try {
      for (let i = 0; i < total; i += chunkSize) {
        const chunk = dataArray.slice(i, i + chunkSize);
        setCurrentTask(`Création de ${i} à ${Math.min(i + chunkSize, total)}...`);

        const processedChunk = chunk.map((user, index) => {
          const pass = generatePassword();
          const newUserObj = {
            id: `user_${Date.now()}_${i + index}_${Math.random().toString(36).substr(2, 9)}`,
            matricule: generateMatricule(user.nom, user.prenom),
            password: pass,
            passwordGenerated: pass,
            nom: user.nom.toUpperCase(),
            prenom: user.prenom,
            email: user.email || '',
            telephone: user.telephone || '',
            role: user.role === 'formateur' ? 'formateur' : 'user',
            avatar: user.role === 'formateur' ? '🎓' : '👤',
            fullName: `${user.prenom} ${user.nom.toUpperCase()}`,
            createdAt: new Date().toISOString()
          };
          
          return newUserObj;
        });

        allNewUsers = [...allNewUsers, ...processedChunk];
        setProgress(Math.round(((i + chunkSize) / total) * 100));
        
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      // Séparer les apprenants et les formateurs
      const newApprenants = allNewUsers.filter(u => u.role === 'user');
      const newFormateurs = allNewUsers.filter(u => u.role === 'formateur');

      // Récupérer les utilisateurs existants
      const existing = JSON.parse(localStorage.getItem('users') || '[]');
      let allUsers = [...existing];

      // Ajouter les nouveaux formateurs d'abord
      if (newFormateurs.length > 0) {
        allUsers = [...allUsers, ...newFormateurs];
        localStorage.setItem('users', JSON.stringify(allUsers));
      }

      // Assigner les formateurs aux apprenants
      let apprenantsWithFormateur = [...newApprenants];
      const existingFormateurs = allUsers.filter(u => u.role === 'formateur');
      
      if (existingFormateurs.length > 0 && newApprenants.length > 0) {
        apprenantsWithFormateur = assignFormateurToApprenants(newApprenants);
        
        apprenantsWithFormateur.forEach(apprenant => {
          if (apprenant.formateurId) {
            updateFormateurApprenantsList(apprenant.formateurId, apprenant.id);
          }
        });
      }

      // Ajouter les apprenants
      allUsers = [...allUsers, ...apprenantsWithFormateur];
      localStorage.setItem('users', JSON.stringify(allUsers));

      // Créer des conversations par défaut
      createDefaultConversations(apprenantsWithFormateur, existingFormateurs);

      // Exportation automatique des credentials
      const allNewWithCredentials = [...newFormateurs, ...apprenantsWithFormateur];
      if (allNewWithCredentials.length > 0) {
        exportCredentials(allNewWithCredentials);
      }

      setImportResult({
        success: true,
        message: `${allNewWithCredentials.length} utilisateur(s) ajouté(s) avec succès. ${apprenantsWithFormateur.length} apprenant(s) assigné(s) à des formateurs.`
      });

      // Réinitialiser après l'import réussi
      setTimeout(() => {
        resetState();
        if (onImportComplete) onImportComplete();
        onClose();
      }, 2000);

    } catch (err) {
      setError("Une erreur est survenue lors de l'enregistrement : " + err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConversations = (apprenants, formateurs) => {
    apprenants.forEach(apprenant => {
      if (apprenant.formateurId) {
        const formateur = formateurs.find(f => f.id === apprenant.formateurId);
        if (formateur) {
          const welcomeMessage = {
            id: `welcome_${Date.now()}_${apprenant.id}`,
            senderId: formateur.id,
            senderName: formateur.fullName,
            receiverId: apprenant.id,
            receiverName: apprenant.fullName,
            message: `Bonjour ${apprenant.prenom}, bienvenue ! Je suis votre formateur. N'hésitez pas à me contacter si vous avez des questions.`,
            timestamp: new Date().toISOString(),
            read: false,
            senderRole: "formateur"
          };
          
          const key = `chat_${formateur.id}_${apprenant.id}`;
          localStorage.setItem(key, JSON.stringify([welcomeMessage]));
          
          const key2 = `chat_${apprenant.id}_${formateur.id}`;
          localStorage.setItem(key2, JSON.stringify([welcomeMessage]));
        }
      }
    });
  };

  const exportCredentials = (users) => {
    const data = users.map(u => ({
      Matricule: u.matricule,
      MotDePasse: u.password,
      Nom: u.nom,
      Prenom: u.prenom,
      Role: u.role === 'formateur' ? 'Formateur' : 'Apprenant',
      FormateurId: u.formateurId || 'Non assigné'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Identifiants");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer]), `acces_utilisateurs_${Date.now()}.xlsx`);
  };

  const downloadTemplate = () => {
    const template = [
      { Nom: 'Dupont', Prenom: 'Jean', Email: 'jean.dupont@email.com', Telephone: '0555123456', Role: 'user' },
      { Nom: 'Martin', Prenom: 'Marie', Email: 'marie.martin@email.com', Telephone: '0555987654', Role: 'formateur' }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modele_Import");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer]), "modele_import_utilisateurs.xlsx");
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        
        {/* HEADER */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Database size={24} /></div>
            <div>
              <h3 className="text-xl font-bold leading-none">Portail d'Importation</h3>
              <p className="text-xs text-indigo-100 mt-1 uppercase tracking-widest font-medium">AP Learning Management</p>
            </div>
          </div>
          <button onClick={() => { resetState(); onClose(); }} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          {loading ? (
            /* ÉCRAN DE PROGRESSION */
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-300">
              <div className="relative">
                <Loader2 size={80} className="text-indigo-600 animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-indigo-700">{Math.min(progress, 100)}%</span>
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800">Importation en cours...</h4>
                <p className="text-slate-500 text-sm mt-1">{currentTask}</p>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full border border-slate-200 overflow-hidden max-w-md mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : importResult ? (
            /* ÉCRAN DE SUCCÈS */
            <div className="py-12 text-center space-y-4 animate-in cubic-bezier">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 italic">TERMINÉ !</h2>
              <p className="text-slate-500 font-medium">{importResult.message}</p>
              <p className="text-xs text-amber-600 bg-amber-50 inline-block px-4 py-2 rounded-full border border-amber-100">
                ⚠️ Un fichier Excel contenant les mots de passe a été téléchargé.
              </p>
            </div>
          ) : (
            /* FORMULAIRE & UPLOAD */
            <div className="space-y-6">
              
              {/* Boutons d'ajout rapide */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setShowAddForm(true); setUserType('user'); }}
                  className="group flex flex-col items-center gap-2 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <UserPlus className="text-blue-600 group-hover:text-white" />
                  <span className="font-bold text-sm uppercase">Nouvel Apprenant</span>
                </button>
                <button 
                  onClick={() => { setShowAddForm(true); setUserType('formateur'); }}
                  className="group flex flex-col items-center gap-2 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl hover:bg-amber-600 hover:text-white transition-all duration-300"
                >
                  <GraduationCap className="text-amber-600 group-hover:text-white" />
                  <span className="font-bold text-sm uppercase">Nouveau Formateur</span>
                </button>
              </div>

              {/* Formulaire Manuel */}
              {showAddForm && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-black text-slate-700 uppercase tracking-tight italic">
                      Saisie manuelle : {userType === 'user' ? 'Apprenant' : 'Formateur'}
                    </h4>
                    <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="Nom" className="modern-input" onChange={e => setNewUser({...newUser, nom: e.target.value})} />
                    <input type="text" placeholder="Prénom" className="modern-input" onChange={e => setNewUser({...newUser, prenom: e.target.value})} />
                  </div>
                  <input type="email" placeholder="Email (facultatif)" className="modern-input mb-4" onChange={e => setNewUser({...newUser, email: e.target.value})} />
                  <button 
                    disabled={!newUser.nom || !newUser.prenom}
                    onClick={() => executeImport([{...newUser, role: userType}])}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 disabled:opacity-30 shadow-lg shadow-emerald-100 transition-all"
                  >
                    AJOUTER MAINTENANT
                  </button>
                </div>
              )}

              {/* Zone Drag & Drop */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black text-slate-400 uppercase italic">Importation Fichier</span>
                  <button 
                    onClick={downloadTemplate}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                  >
                    <Download size={12} /> Télécharger Modèle
                  </button>
                </div>

                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`
                    border-4 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer group
                    ${file ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'}
                  `}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                  {file ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <FileSpreadsheet size={32}/>
                      </div>
                      <p className="font-black text-emerald-800">{file.name}</p>
                      <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(2)} KB • Prêt à l'analyse</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearCurrentFile(); }}
                        className="mt-4 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Supprimer ce fichier
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={54} className="text-slate-300 mb-4 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                      <p className="font-black text-slate-700 uppercase tracking-tighter">Glissez votre fichier ici</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Excel ou CSV uniquement</p>
                    </>
                  )}
                </div>
              </div>

              {/* Aperçu des données */}
              {previewData.length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm font-bold text-slate-700 mb-2">Aperçu des données ({previewData.length} lignes):</p>
                  <div className="max-h-40 overflow-y-auto">
                    {previewData.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-600 py-1 border-b border-slate-200">
                        {item.nom} {item.prenom} - {item.email || 'pas d\'email'}
                      </div>
                    ))}
                    {previewData.length > 5 && (
                      <p className="text-xs text-slate-400 mt-2">... et {previewData.length - 5} autres</p>
                    )}
                  </div>
                </div>
              )}

              {/* Erreurs */}
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-center gap-3 border border-rose-100">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                </div>
              )}

              {/* Action */}
              {previewData.length > 0 && !importResult && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-black uppercase tracking-tight">
                      {previewData.length} utilisateurs détectés avec succès
                    </span>
                  </div>
                  <button 
                    onClick={() => executeImport(previewData)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-600 hover:-translate-y-1 shadow-2xl shadow-slate-200 transition-all active:scale-95 uppercase tracking-tighter italic"
                  >
                    Lancer l'importation massive
                  </button>
                </div>
              )}

              {/* Help Box */}
              <div className="p-4 bg-slate-50 rounded-2xl flex gap-3">
                <Info size={18} className="text-slate-400 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-normal uppercase font-bold tracking-tight">
                  Les mots de passe sont générés aléatoirement. Pour les imports de masse, un récapitulatif Excel sera automatiquement téléchargé pour vos archives.<br/>
                  <strong className="text-indigo-600">Note :</strong> Les apprenants seront automatiquement assignés aux formateurs existants.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modern-input {
          width: 100%;
          padding: 12px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .modern-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ImportExcel;