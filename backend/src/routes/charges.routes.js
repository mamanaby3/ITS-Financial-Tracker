const express = require('express');
const router = express.Router();
const ChargeModel = require('../models/charge.model');

// Obtenir les types de charges
router.get('/types-charges', async (req, res) => {
  try {
    const types = await ChargeModel.getTypesCharges();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les charges par mois
router.get('/mois/:annee/:mois', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const charges = await ChargeModel.findByMonth(annee, mois);
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les charges par type pour un mois
router.get('/mois/:annee/:mois/par-type', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const chargesParType = await ChargeModel.getChargesByType(annee, mois);
    res.json(chargesParType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir le total des charges pour un mois
router.get('/mois/:annee/:mois/total', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const total = await ChargeModel.getTotalByMonth(annee, mois);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les charges par année
router.get('/annee/:annee', async (req, res) => {
  try {
    const charges = await ChargeModel.findByYear(req.params.annee);
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une charge par ID
router.get('/:id', async (req, res) => {
  try {
    const charge = await ChargeModel.findById(req.params.id);
    if (!charge) {
      return res.status(404).json({ error: 'Charge non trouvée' });
    }
    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer ou mettre à jour une charge (upsert)
router.post('/upsert', async (req, res) => {
  try {
    const result = await ChargeModel.upsert(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Créer une nouvelle charge
router.post('/', async (req, res) => {
  try {
    const charge = await ChargeModel.create(req.body);
    res.status(201).json(charge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour une charge
router.put('/:id', async (req, res) => {
  try {
    const success = await ChargeModel.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Charge non trouvée' });
    }
    res.json({ message: 'Charge mise à jour avec succès' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une charge
router.delete('/:id', async (req, res) => {
  try {
    const success = await ChargeModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Charge non trouvée' });
    }
    res.json({ message: 'Charge supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;