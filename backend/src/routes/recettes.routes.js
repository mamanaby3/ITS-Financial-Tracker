const express = require('express');
const router = express.Router();
const RecetteModel = require('../models/recette.model');

// Obtenir les types de prestations
router.get('/types-prestations', async (req, res) => {
  try {
    const types = await RecetteModel.getTypesPrestations();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir toutes les recettes d'un navire
router.get('/navire/:navireId', async (req, res) => {
  try {
    const recettes = await RecetteModel.findByNavire(req.params.navireId);
    res.json(recettes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir le total des recettes d'un navire
router.get('/navire/:navireId/total', async (req, res) => {
  try {
    const total = await RecetteModel.getTotalByNavire(req.params.navireId);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une recette par ID
router.get('/:id', async (req, res) => {
  try {
    const recette = await RecetteModel.findById(req.params.id);
    if (!recette) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    res.json(recette);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une nouvelle recette
router.post('/', async (req, res) => {
  try {
    const recette = await RecetteModel.create(req.body);
    res.status(201).json(recette);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour une recette
router.put('/:id', async (req, res) => {
  try {
    const success = await RecetteModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    res.json({ message: 'Recette mise à jour avec succès' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une recette
router.delete('/:id', async (req, res) => {
  try {
    const success = await RecetteModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    res.json({ message: 'Recette supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;