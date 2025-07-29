const express = require('express');
const router = express.Router();
const ClientModel = require('../models/client.model');

// Obtenir tous les clients
router.get('/', async (req, res) => {
  try {
    const clients = await ClientModel.getAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un client par ID
router.get('/:id', async (req, res) => {
  try {
    const client = await ClientModel.getById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouveau client
router.post('/', async (req, res) => {
  try {
    const id = await ClientModel.create(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un client
router.put('/:id', async (req, res) => {
  try {
    await ClientModel.update(req.params.id, req.body);
    res.json({ message: 'Client mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    await ClientModel.delete(req.params.id);
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les navires d'un client
router.get('/:id/navires', async (req, res) => {
  try {
    const navires = await ClientModel.getNaviresByClient(req.params.id);
    res.json(navires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;