// services/formationApi.js
const API_URL = 'http://localhost:5000/api';

class FormationAPI {
  // Récupérer le token d'authentification
  getToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Aucun token trouvé dans localStorage');
      return null;
    }
    return token;
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!this.getToken();
  }

  // Obtenir les headers avec le token
  getHeaders() {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Récupérer toutes les formations
  async getAllFormations() {
    try {
      console.log('🔍 Récupération des formations depuis MongoDB...');
      
      const response = await fetch(`${API_URL}/formations`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Non autorisé - Token invalide');
          // Rediriger vers login si nécessaire
          if (window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
          }
          return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${data.data?.length || 0} formations chargées`);
        return data.data || [];
      } else {
        console.error('❌ API error:', data.message);
        return [];
      }
      
    } catch (error) {
      console.error('❌ Erreur getAllFormations:', error);
      return [];
    }
  }

  // Récupérer une formation par ID
  async getFormationById(id) {
    try {
      const response = await fetch(`${API_URL}/formations/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
      
    } catch (error) {
      console.error('❌ Erreur getFormationById:', error);
      return null;
    }
  }

  // Créer une nouvelle formation
  async createFormation(formationData) {
    try {
      const token = this.getToken();
      
      if (!token) {
        return { 
          success: false, 
          message: 'Token manquant. Veuillez vous reconnecter.' 
        };
      }
      
      console.log('📝 Création formation:', formationData.titre);
      
      const response = await fetch(`${API_URL}/formations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(formationData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Formation créée avec succès');
        return { success: true, data: data.data };
      } else {
        console.error('❌ Erreur création:', data.message);
        return { success: false, message: data.message || 'Erreur lors de la création' };
      }
      
    } catch (error) {
      console.error('❌ Erreur createFormation:', error);
      return { success: false, message: error.message };
    }
  }

  // Mettre à jour une formation
  async updateFormation(id, formationData) {
    try {
      const token = this.getToken();
      
      if (!token) {
        return { 
          success: false, 
          message: 'Token manquant. Veuillez vous reconnecter.' 
        };
      }
      
      console.log('✏️ Mise à jour formation:', id);
      
      const response = await fetch(`${API_URL}/formations/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(formationData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Formation mise à jour');
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Erreur lors de la mise à jour' };
      }
      
    } catch (error) {
      console.error('❌ Erreur updateFormation:', error);
      return { success: false, message: error.message };
    }
  }

  // Supprimer une formation
  async deleteFormation(id) {
    try {
      const token = this.getToken();
      
      if (!token) {
        return { 
          success: false, 
          message: 'Token manquant. Veuillez vous reconnecter.' 
        };
      }
      
      console.log('🗑️ Suppression formation:', id);
      
      const response = await fetch(`${API_URL}/formations/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Formation supprimée');
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Erreur lors de la suppression' };
      }
      
    } catch (error) {
      console.error('❌ Erreur deleteFormation:', error);
      return { success: false, message: error.message };
    }
  }

  // Filtrer les formations par domaine
  async getFormationsByDomaine(domaine) {
    try {
      const response = await fetch(`${API_URL}/formations/domaine/${domaine}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : [];
      
    } catch (error) {
      console.error('❌ Erreur getFormationsByDomaine:', error);
      return [];
    }
  }

  // Rechercher des formations
  async searchFormations(keyword) {
    try {
      const response = await fetch(`${API_URL}/formations/search/${keyword}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : [];
      
    } catch (error) {
      console.error('❌ Erreur searchFormations:', error);
      return [];
    }
  }

  // Obtenir les statistiques des formations
  async getFormationsStats() {
    try {
      const response = await fetch(`${API_URL}/formations/stats/total`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
      
    } catch (error) {
      console.error('❌ Erreur getFormationsStats:', error);
      return null;
    }
  }
}

export default new FormationAPI();