const RapportAnnuelModel = require('../models/rapport-annuel.model');
const generateRapportAnnuelExcel = require('../services/rapport-annuel-excel.service');

class RapportAnnuelController {
  // Obtenir le rapport annuel complet
  static async getRapportAnnuelComplet(req, res) {
    try {
      const { annee } = req.params;
      const rapport = await RapportAnnuelModel.getRapportAnnuelComplet(annee);
      res.json({
        success: true,
        data: rapport
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du rapport annuel complet:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Obtenir le résumé annuel
  static async getResumeAnnuel(req, res) {
    try {
      const { annee } = req.params;
      const resume = await RapportAnnuelModel.getResumeAnnuel(annee);
      res.json(resume);
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé annuel:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir le total annuel
  static async getTotalAnnuel(req, res) {
    try {
      const { annee } = req.params;
      const total = await RapportAnnuelModel.getTotalAnnuel(annee);
      res.json(total);
    } catch (error) {
      console.error('Erreur lors de la récupération du total annuel:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir les statistiques annuelles
  static async getStatistiquesAnnuelles(req, res) {
    try {
      const { annee } = req.params;
      const stats = await RapportAnnuelModel.getStatistiquesAnnuelles(annee);
      res.json(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques annuelles:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir le top des navires
  static async getTopNavires(req, res) {
    try {
      const { annee } = req.params;
      const topNavires = await RapportAnnuelModel.getTopNavires(annee);
      res.json(topNavires);
    } catch (error) {
      console.error('Erreur lors de la récupération du top navires:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir tous les navires de l'année
  static async getTousNavires(req, res) {
    try {
      const { annee } = req.params;
      const navires = await RapportAnnuelModel.getTousNaviresAnnuel(annee);
      res.json(navires);
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les navires:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir le top des clients
  static async getTopClients(req, res) {
    try {
      const { annee } = req.params;
      const topClients = await RapportAnnuelModel.getTopClientsAnnuel(annee);
      res.json(topClients);
    } catch (error) {
      console.error('Erreur lors de la récupération du top clients:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir le top des produits
  static async getTopProduits(req, res) {
    try {
      const { annee } = req.params;
      const topProduits = await RapportAnnuelModel.getTopProduitsAnnuel(annee);
      res.json(topProduits);
    } catch (error) {
      console.error('Erreur lors de la récupération du top produits:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir l'évolution mensuelle
  static async getEvolutionMensuelle(req, res) {
    try {
      const { annee } = req.params;
      const evolution = await RapportAnnuelModel.getEvolutionMensuelleComplete(annee);
      res.json(evolution);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'évolution mensuelle:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Exporter le rapport annuel en Excel
  static async exporterRapportAnnuelExcel(req, res) {
    try {
      const { annee } = req.params;
      console.log('Export Excel demandé pour année:', annee);
      
      const rapport = await RapportAnnuelModel.getRapportAnnuelComplet(annee);
      console.log('Rapport récupéré avec succès');
      
      const workbook = await generateRapportAnnuelExcel(annee, rapport);
      console.log('Workbook généré avec succès');
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=rapport_annuel_its_${annee}.xlsx`);
      
      await workbook.xlsx.write(res);
      console.log('Excel envoyé avec succès');
      res.end();
    } catch (error) {
      console.error('Erreur détaillée lors de l\'export Excel:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        error: error.message,
        details: error.stack 
      });
    }
  }
}

module.exports = RapportAnnuelController;