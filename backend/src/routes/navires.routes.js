const express = require('express');
const router = express.Router();
const NavireModel = require('../models/navire.model');

// Obtenir tous les navires
router.get('/', async (req, res) => {
  try {
    const navires = await NavireModel.findAll();
    res.json(navires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les navires par mois
router.get('/mois/:annee/:mois', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const navires = await NavireModel.findByMonth(annee, mois);
    res.json(navires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un navire par ID
router.get('/:id', async (req, res) => {
  try {
    const navire = await NavireModel.findById(req.params.id);
    if (!navire) {
      return res.status(404).json({ error: 'Navire non trouvé' });
    }
    res.json(navire);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir le résultat d'un navire
router.get('/:id/resultat', async (req, res) => {
  try {
    const resultat = await NavireModel.getResultat(req.params.id);
    if (!resultat) {
      return res.status(404).json({ error: 'Navire non trouvé' });
    }
    res.json(resultat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les résultats par mois
router.get('/resultats/:annee/:mois', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const resultats = await NavireModel.getResultatsByMonth(annee, mois);
    res.json(resultats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouveau navire
router.post('/', async (req, res) => {
  try {
    console.log('Données reçues pour création navire:', req.body);
    
    // Validation des champs requis
    const { nom, date_arrivee } = req.body;
    if (!nom || !date_arrivee) {
      return res.status(400).json({ 
        error: 'Les champs nom et date_arrivee sont requis',
        received: req.body
      });
    }
    
    const navire = await NavireModel.create(req.body);
    res.status(201).json(navire);
  } catch (error) {
    console.error('Erreur création navire:', error);
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour un navire
router.put('/:id', async (req, res) => {
  try {
    const success = await NavireModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Navire non trouvé' });
    }
    res.json({ message: 'Navire mis à jour avec succès' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un navire
router.delete('/:id', async (req, res) => {
  try {
    const success = await NavireModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Navire non trouvé' });
    }
    res.json({ message: 'Navire supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un navire avec ses clients
router.get('/:id/details', async (req, res) => {
  try {
    const navire = await NavireModel.findByIdWithClients(req.params.id);
    if (!navire) {
      return res.status(404).json({ error: 'Navire non trouvé' });
    }
    res.json(navire);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajouter un client à un navire
router.post('/:id/clients', async (req, res) => {
  try {
    const navireId = req.params.id;
    const clientId = await NavireModel.addClient(navireId, req.body);
    res.status(201).json({ id: clientId, navire_id: navireId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les clients d'un navire
router.get('/:id/clients', async (req, res) => {
  try {
    const clients = await NavireModel.getClients(req.params.id);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un client d'un navire
router.delete('/:id/clients/:clientId', async (req, res) => {
  try {
    const success = await NavireModel.removeClient(req.params.clientId);
    if (!success) {
      return res.status(404).json({ error: 'Client du navire non trouvé' });
    }
    res.json({ message: 'Client retiré du navire avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;