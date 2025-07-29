const express = require('express');
const router = express.Router();
const RapportAnnuelController = require('../controllers/rapport-annuel.controller');

// Routes pour les rapports annuels
router.get('/annuel/:annee/complet', RapportAnnuelController.getRapportAnnuelComplet);
router.get('/annuel/:annee/resume', RapportAnnuelController.getResumeAnnuel);
router.get('/annuel/:annee/total', RapportAnnuelController.getTotalAnnuel);
router.get('/annuel/:annee/statistiques', RapportAnnuelController.getStatistiquesAnnuelles);
router.get('/annuel/:annee/navires/top', RapportAnnuelController.getTopNavires);
router.get('/annuel/:annee/navires/tous', RapportAnnuelController.getTousNavires);
router.get('/annuel/:annee/clients/top', RapportAnnuelController.getTopClients);
router.get('/annuel/:annee/produits/top', RapportAnnuelController.getTopProduits);
router.get('/annuel/:annee/evolution', RapportAnnuelController.getEvolutionMensuelle);
router.get('/annuel/:annee/export/excel', RapportAnnuelController.exporterRapportAnnuelExcel);

module.exports = router;