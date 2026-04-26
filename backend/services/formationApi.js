// src/services/formationApi.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');
const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  }
});

const formationAPI = {
  // Récupérer toutes les formations
  getAllFormations: async () => {
    try {
      const response = await axios.get(`${API_URL}/formations`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur chargement formations:', error);
      throw error;
    }
  },

  // Récupérer une formation par ID
  getFormationById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/formations/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Erreur chargement formation:', error);
      throw error;
    }
  },

  // Créer une formation
  createFormation: async (formationData) => {
    try {
      const response = await axios.post(`${API_URL}/formations`, formationData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur création formation:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Mettre à jour une formation
  updateFormation: async (id, formationData) => {
    try {
      const response = await axios.put(`${API_URL}/formations/${id}`, formationData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour formation:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // Supprimer une formation
  deleteFormation: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/formations/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur suppression formation:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};

export default formationAPI;