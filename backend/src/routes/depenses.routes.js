const express = require('express');
const router = express.Router();
const DepenseModel = require('../models/depense.model');

// Obtenir les types de dépenses
router.get('/types-depenses', async (req, res) => {
  try {
    const types = await DepenseModel.getTypesDepenses();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir toutes les dépenses d'un navire
router.get('/navire/:navireId', async (req, res) => {
  try {
    const depenses = await DepenseModel.findByNavire(req.params.navireId);
    res.json(depenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir le total des dépenses d'un navire
router.get('/navire/:navireId/total', async (req, res) => {
  try {
    const total = await DepenseModel.getTotalByNavire(req.params.navireId);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les dépenses par type pour un navire
router.get('/navire/:navireId/par-type', async (req, res) => {
  try {
    const depensesParType = await DepenseModel.getDepensesByType(req.params.navireId);
    res.json(depensesParType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une dépense par ID
router.get('/:id', async (req, res) => {
  try {
    const depense = await DepenseModel.findById(req.params.id);
    if (!depense) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }
    res.json(depense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une nouvelle dépense
router.post('/', async (req, res) => {
  try {
    const depense = await DepenseModel.create(req.body);
    res.status(201).json(depense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour une dépense
router.put('/:id', async (req, res) => {
  try {
    const success = await DepenseModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }
    res.json({ message: 'Dépense mise à jour avec succès' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une dépense
router.delete('/:id', async (req, res) => {
  try {
    const success = await DepenseModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }
    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;