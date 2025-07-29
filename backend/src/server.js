const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import des routes
const naviresRoutes = require('./routes/navires.routes');
const recettesRoutes = require('./routes/recettes.routes');
const depensesRoutes = require('./routes/depenses.routes');
const chargesRoutes = require('./routes/charges.routes');
const rapportsRoutes = require('./routes/rapports.routes');
const rapportsAnnuelsRoutes = require('./routes/rapports-annuels.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/navires', naviresRoutes);
app.use('/api/recettes', recettesRoutes);
app.use('/api/depenses', depensesRoutes);
app.use('/api/charges', chargesRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/rapports', rapportsAnnuelsRoutes);
app.use('/api/clients', require('./routes/clients.routes'));
app.use('/api/produits', require('./routes/produits.routes'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API ITS Financial Tracker en ligne' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Une erreur est survenue', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Démarrage du serveur
async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();