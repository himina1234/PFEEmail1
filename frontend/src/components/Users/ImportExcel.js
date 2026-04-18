// ImportExcel.js - Version complète avec MongoDB (à placer dans components/Users/)
import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { 
  FileSpreadsheet, UserPlus, GraduationCap, X, 
  Download, UploadCloud, CheckCircle2, AlertCircle, 
  Info, Loader2, Database, ShieldCheck, Trash2
} from 'lucide-react';

const ImportExcel = ({ onClose, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userType, setUserType] = useState('apprenant');
  const [newUser, setNewUser] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    setImportResult(null);
    setProgress(0);
    setCurrentTask("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => resetState();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
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
          role: String(row.Role || row.role || 'apprenant').toLowerCase()
        })).filter(u => u.nom && u.prenom && u.email);

        if (validatedData.length === 0) {
          setError("Le fichier ne contient aucune donnée valide (colonnes 'nom', 'prenom' et 'email' requises).");
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

  const clearCurrentFile = () => {
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // IMPORT VERS MONGODB
  const executeImport = async (dataArray) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setCurrentTask("Préparation des données...");

    const token = getAuthToken();
    if (!token) {
      setError("Vous devez être connecté pour importer des utilisateurs");
      setLoading(false);
      return;
    }

    try {
      const usersToImport = dataArray.map(user => ({
        nom: user.nom.toUpperCase(),
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone || '',
        role: user.role === 'formateur' ? 'formateur' : 'apprenant'
      }));

      setCurrentTask(`Envoi de ${usersToImport.length} utilisateurs vers MongoDB...`);
      setProgress(30);

      const response = await axios.post(`${API_URL}/users/import-batch`, 
        { users: usersToImport },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProgress(100);
      
      if (response.data.success) {
        setImportResult({
          success: true,
          message: response.data.message
        });

        if (response.data.data && response.data.data.created && response.data.data.created.length > 0) {
          exportCredentials(response.data.data.created);
        }

        // Rafraîchir la liste des utilisateurs
        if (onImportComplete) {
          onImportComplete();
        }

        setTimeout(() => {
          resetState();
          onClose();
        }, 2000);
      } else {
        throw new Error(response.data.message || "Erreur lors de l'import");
      }

    } catch (err) {
      console.error('Erreur import:', err);
      setError(err.response?.data?.message || err.message || "Une erreur est survenue");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const addSingleUser = async () => {
    if (!newUser.nom || !newUser.prenom || !newUser.email) {
      setError("Nom, prénom et email requis");
      return;
    }

    setLoading(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      setError("Vous devez être connecté");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        nom: newUser.nom.toUpperCase(),
        prenom: newUser.prenom,
        email: newUser.email,
        telephone: newUser.telephone || '',
        role: userType
      };

      const response = await axios.post(`${API_URL}/users/import-batch`,
        { users: [userData] },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.data.created.length > 0) {
        exportCredentials(response.data.data.created);
        setImportResult({
          success: true,
          message: `Utilisateur ${newUser.prenom} ${newUser.nom} ajouté avec succès.`
        });
        
        if (onImportComplete) {
          onImportComplete();
        }
        
        setTimeout(() => {
          setShowAddForm(false);
          setNewUser({ nom: '', prenom: '', email: '', telephone: '' });
          setImportResult(null);
          onClose();
        }, 2000);
      } else {
        throw new Error(response.data.message || "Erreur d'ajout");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const exportCredentials = (users) => {
    const data = users.map(u => ({
      Matricule: u.matricule,
      MotDePasse: u.temporaryPassword,
      Nom: u.nom,
      Prenom: u.prenom,
      Email: u.email,
      Telephone: u.telephone || '',
      Role: u.role === 'formateur' ? 'Formateur' : 'Apprenant'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Identifiants");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer]), `acces_utilisateurs_${Date.now()}.xlsx`);
  };

  const downloadTemplate = () => {
    const template = [
      { Nom: 'BENALI', Prenom: 'Ahmed', Email: 'ahmed.benali@poste.dz', Telephone: '0555123456', Role: 'formateur' },
      { Nom: 'MEHDI', Prenom: 'Karim', Email: 'karim.mehdi@poste.dz', Telephone: '0555778899', Role: 'apprenant' }
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
        
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Database size={24} /></div>
            <div>
              <h3 className="text-xl font-bold leading-none">Importation MongoDB</h3>
              <p className="text-xs text-indigo-100 mt-1 uppercase tracking-widest font-medium">AP Learning Management</p>
            </div>
          </div>
          <button onClick={() => { resetState(); onClose(); }} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center text-center space-y-6">
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
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden max-w-md mx-auto">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : importResult ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="text-3xl font-black text-slate-800">TERMINÉ !</h2>
              <p className="text-slate-500 font-medium">{importResult.message}</p>
              <p className="text-xs text-amber-600 bg-amber-50 inline-block px-4 py-2 rounded-full">
                ⚠️ Un fichier Excel contenant les identifiants a été téléchargé.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Boutons d'ajout rapide */}
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setShowAddForm(true); setUserType('apprenant'); }} className="group flex flex-col items-center gap-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                  <UserPlus className="text-blue-600 group-hover:text-white" size={24} />
                  <span className="font-bold text-sm uppercase">Nouvel Apprenant</span>
                </button>
                <button onClick={() => { setShowAddForm(true); setUserType('formateur'); }} className="group flex flex-col items-center gap-2 p-4 bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-600 hover:text-white transition-all">
                  <GraduationCap className="text-amber-600 group-hover:text-white" size={24} />
                  <span className="font-bold text-sm uppercase">Nouveau Formateur</span>
                </button>
              </div>

              {/* Formulaire Manuel */}
              {showAddForm && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-black text-slate-700 uppercase">Saisie manuelle : {userType === 'apprenant' ? 'Apprenant' : 'Formateur'}</h4>
                    <button onClick={() => setShowAddForm(false)} className="text-slate-400"><X size={18}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input 
                      type="text" 
                      placeholder="Nom" 
                      className="modern-input" 
                      onChange={e => setNewUser({...newUser, nom: e.target.value})} 
                    />
                    <input 
                      type="text" 
                      placeholder="Prénom" 
                      className="modern-input" 
                      onChange={e => setNewUser({...newUser, prenom: e.target.value})} 
                    />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="modern-input mb-4" 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  />
                  <input 
                    type="tel" 
                    placeholder="Téléphone (optionnel)" 
                    className="modern-input mb-4" 
                    onChange={e => setNewUser({...newUser, telephone: e.target.value})} 
                  />
                  <button 
                    disabled={!newUser.nom || !newUser.prenom || !newUser.email} 
                    onClick={addSingleUser} 
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 disabled:opacity-30 transition-all"
                  >
                    AJOUTER À MONGODB
                  </button>
                </div>
              )}

              {/* Zone Drag & Drop */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black text-slate-400 uppercase">Importation Fichier Excel</span>
                  <button onClick={downloadTemplate} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors">
                    <Download size={12} /> Télécharger Modèle
                  </button>
                </div>

                <div onClick={() => fileInputRef.current.click()} className={`border-4 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer transition-all group ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-400'}`}>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                  {file ? (
                    <>
                      <FileSpreadsheet size={48} className="text-emerald-600 mb-4" />
                      <p className="font-black text-emerald-800">{file.name}</p>
                      <button onClick={(e) => { e.stopPropagation(); clearCurrentFile(); }} className="mt-4 text-xs text-red-500 flex items-center gap-1 hover:text-red-700">
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={54} className="text-slate-300 mb-4 group-hover:text-indigo-500 transition-all" />
                      <p className="font-black text-slate-700 uppercase">Glissez votre fichier Excel</p>
                      <p className="text-[10px] text-slate-400 uppercase mt-1">.xlsx, .xls ou .csv</p>
                    </>
                  )}
                </div>
              </div>

              {/* Aperçu */}
              {previewData.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm font-bold text-slate-700 mb-2">Aperçu ({previewData.length} lignes):</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {previewData.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-600 py-1 border-b border-slate-200">
                        {item.nom} {item.prenom} - {item.email} - {item.role || 'apprenant'}
                      </div>
                    ))}
                    {previewData.length > 5 && (
                      <p className="text-xs text-slate-400 italic">... et {previewData.length - 5} autres</p>
                    )}
                  </div>
                </div>
              )}

              {/* Erreurs */}
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-center gap-3">
                  <AlertCircle size={20} />
                  <p className="text-xs font-bold uppercase">{error}</p>
                </div>
              )}

              {/* Action */}
              {previewData.length > 0 && !importResult && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 p-3 rounded-xl">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-black uppercase">{previewData.length} utilisateur(s) à importer dans MongoDB</span>
                  </div>
                  <button 
                    onClick={() => executeImport(previewData)} 
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all transform hover:scale-105"
                  >
                    Lancer l'importation vers MongoDB
                  </button>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl flex gap-3">
                <Info size={18} className="text-slate-400" />
                <p className="text-[10px] text-slate-500 uppercase font-bold leading-relaxed">
                  Les mots de passe sont générés automatiquement. Un fichier Excel avec les identifiants sera téléchargé.<br/>
                  <strong className="text-indigo-600">Note :</strong> Les données sont enregistrées dans MongoDB.
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default ImportExcel;