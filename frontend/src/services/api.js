import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Services Navires
export const naviresService = {
  getAll: () => api.get('/navires'),
  getById: (id) => api.get(`/navires/${id}`),
  getByIdWithClients: (id) => api.get(`/navires/${id}/details`),
  getByMonth: (annee, mois) => api.get(`/navires/mois/${annee}/${mois}`),
  getResultat: (id) => api.get(`/navires/${id}/resultat`),
  getResultatsByMonth: (annee, mois) => api.get(`/navires/resultats/${annee}/${mois}`),
  create: (data) => api.post('/navires', data),
  update: (id, data) => api.put(`/navires/${id}`, data),
  delete: (id) => api.delete(`/navires/${id}`),
  // Gestion des clients
  getClients: (id) => api.get(`/navires/${id}/clients`),
  addClient: (id, clientData) => api.post(`/navires/${id}/clients`, clientData),
  removeClient: (navireId, clientId) => api.delete(`/navires/${navireId}/clients/${clientId}`)
};

// Services Recettes
export const recettesService = {
  getTypesPrestations: () => api.get('/recettes/types-prestations'),
  getByNavire: (navireId) => api.get(`/recettes/navire/${navireId}`),
  getTotalByNavire: (navireId) => api.get(`/recettes/navire/${navireId}/total`),
  create: (data) => api.post('/recettes', data),
  update: (id, data) => api.put(`/recettes/${id}`, data),
  delete: (id) => api.delete(`/recettes/${id}`)
};

// Services Dépenses
export const depensesService = {
  getTypesDepenses: () => api.get('/depenses/types-depenses'),
  getByNavire: (navireId) => api.get(`/depenses/navire/${navireId}`),
  getTotalByNavire: (navireId) => api.get(`/depenses/navire/${navireId}/total`),
  getByType: (navireId) => api.get(`/depenses/navire/${navireId}/par-type`),
  create: (data) => api.post('/depenses', data),
  update: (id, data) => api.put(`/depenses/${id}`, data),
  delete: (id) => api.delete(`/depenses/${id}`)
};

// Services Charges
export const chargesService = {
  getTypesCharges: () => api.get('/charges/types-charges'),
  getByMonth: (annee, mois) => api.get(`/charges/mois/${annee}/${mois}`),
  getByType: (annee, mois) => api.get(`/charges/mois/${annee}/${mois}/par-type`),
  getTotalByMonth: (annee, mois) => api.get(`/charges/mois/${annee}/${mois}/total`),
  getByYear: (annee) => api.get(`/charges/annee/${annee}`),
  upsert: (data) => api.post('/charges/upsert', data),
  update: (id, data) => api.put(`/charges/${id}`, data),
  delete: (id) => api.delete(`/charges/${id}`)
};

// Services Clients
export const clientsService = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  getNavires: (id) => api.get(`/clients/${id}/navires`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

// Services Produits
export const produitsService = {
  getAll: () => api.get('/produits'),
  getById: (id) => api.get(`/produits/${id}`),
  create: (data) => api.post('/produits', data),
  update: (id, data) => api.put(`/produits/${id}`, data),
  delete: (id) => api.delete(`/produits/${id}`)
};

// Services Rapports
export const rapportsService = {
  getMensuel: (annee, mois) => api.get(`/rapports/mensuel/${annee}/${mois}`),
  getDetailsMensuel: (annee, mois) => api.get(`/rapports/mensuel/${annee}/${mois}/details`),
  getStatistiquesMensuel: (annee, mois) => api.get(`/rapports/mensuel/${annee}/${mois}/statistiques`),
  getAnnuel: (annee) => api.get(`/rapports/annuel/${annee}`),
  getEvolution: (annee) => api.get(`/rapports/evolution/${annee}`),
  exportExcel: (annee, mois) => `${API_BASE_URL}/rapports/export/excel/${annee}/${mois}`,
  exportPdf: (annee, mois) => `${API_BASE_URL}/rapports/export/pdf/${annee}/${mois}`,
  // Rapport Annuel
  getRapportAnnuelComplet: (annee) => api.get(`/rapports/annuel/${annee}/complet`),
  getResumeAnnuel: (annee) => api.get(`/rapports/annuel/${annee}/resume`),
  getTotalAnnuel: (annee) => api.get(`/rapports/annuel/${annee}/total`),
  getStatistiquesAnnuelles: (annee) => api.get(`/rapports/annuel/${annee}/statistiques`),
  getTopNavires: (annee) => api.get(`/rapports/annuel/${annee}/navires/top`),
  getTousNavires: (annee) => api.get(`/rapports/annuel/${annee}/navires/tous`),
  getTopClients: (annee) => api.get(`/rapports/annuel/${annee}/clients/top`),
  getTopProduits: (annee) => api.get(`/rapports/annuel/${annee}/produits/top`),
  getEvolutionAnnuelle: (annee) => api.get(`/rapports/annuel/${annee}/evolution`),
  exportExcelAnnuel: (annee) => `${API_BASE_URL}/rapports/annuel/${annee}/export/excel`
};

export default api;