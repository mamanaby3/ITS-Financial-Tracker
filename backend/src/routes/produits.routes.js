const express = require('express');
const router = express.Router();
const ProduitModel = require('../models/produit.model');

// Obtenir tous les produits
router.get('/', async (req, res) => {
  try {
    const produits = await ProduitModel.getAll();
    res.json(produits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const produit = await ProduitModel.getById(req.params.id);
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(produit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouveau produit
router.post('/', async (req, res) => {
  try {
    const id = await ProduitModel.create(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un produit
router.put('/:id', async (req, res) => {
  try {
    await ProduitModel.update(req.params.id, req.body);
    res.json({ message: 'Produit mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un produit
router.delete('/:id', async (req, res) => {
  try {
    await ProduitModel.delete(req.params.id);
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;