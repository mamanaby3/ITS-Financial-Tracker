const { pool } = require('../config/database');

class NavireModel {
  static async create(navireData) {
    const { 
      nom, 
      tonnage_total, 
      date_arrivee, 
      date_depart, 
      statut,
      numero_imo,
      client_nom,
      produit_nom,
      quantite,
      client_id,
      produit_id
    } = navireData;
    
    console.log('Creating navire with data:', navireData);
    
    const [result] = await pool.execute(
      'INSERT INTO navires (nom, tonnage_total, date_arrivee, date_depart, statut, numero_imo, client_nom, produit_nom, quantite, client_id, produit_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        nom, 
        tonnage_total || 0, 
        date_arrivee, 
        date_depart || null, 
        statut || 'en_cours',
        numero_imo || null,
        client_nom || null,
        produit_nom || null,
        quantite || null,
        client_id || null,
        produit_id || null
      ]
    );
    return { id: result.insertId, ...navireData };
  }

  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT 
        n.*,
        GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ') as clients_noms,
        GROUP_CONCAT(DISTINCT p.nom ORDER BY p.nom SEPARATOR ', ') as produits_noms,
        COUNT(DISTINCT nc.client_id) as nombre_clients
      FROM navires n
      LEFT JOIN navire_clients nc ON n.id = nc.navire_id
      LEFT JOIN clients c ON nc.client_id = c.id
      LEFT JOIN produits p ON nc.produit_id = p.id
      GROUP BY n.id
      ORDER BY n.date_arrivee DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM navires WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByMonth(annee, mois) {
    const [rows] = await pool.execute(
      'SELECT * FROM navires WHERE YEAR(date_arrivee) = ? AND MONTH(date_arrivee) = ? ORDER BY date_arrivee',
      [annee, mois]
    );
    return rows;
  }

  static async update(id, navireData) {
    const { nom, tonnage_total, client_id, produit_id, date_arrivee, date_depart, statut } = navireData;
    
    const [result] = await pool.execute(
      'UPDATE navires SET nom = ?, tonnage_total = ?, client_id = ?, produit_id = ?, date_arrivee = ?, date_depart = ?, statut = ? WHERE id = ?',
      [nom, tonnage_total || 0, client_id || null, produit_id || null, date_arrivee, date_depart, statut, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM navires WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getResultat(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM vue_resultats_navires WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getResultatsByMonth(annee, mois) {
    const [rows] = await pool.execute(`
      SELECT 
        n.*,
        vr.total_recettes,
        vr.total_depenses,
        vr.resultat_net
      FROM navires n
      LEFT JOIN vue_resultats_navires vr ON n.id = vr.id
      WHERE YEAR(n.date_arrivee) = ? AND MONTH(n.date_arrivee) = ?
      ORDER BY n.date_arrivee
    `, [annee, mois]);
    return rows;
  }

  // Ajouter un client à un navire (version simplifiée avec noms)
  static async addClient(navireId, clientData) {
    const { nom_client, nom_produit, quantite, date_chargement } = clientData;
    
    // Créer ou retrouver le client
    let clientId = null;
    if (nom_client) {
      // Vérifier si le client existe déjà
      const [existingClient] = await pool.execute(
        'SELECT id FROM clients WHERE nom = ?',
        [nom_client]
      );
      
      if (existingClient.length > 0) {
        clientId = existingClient[0].id;
      } else {
        // Créer un nouveau client
        const [newClient] = await pool.execute(
          'INSERT INTO clients (nom, code_client) VALUES (?, ?)',
          [nom_client, nom_client.toUpperCase().replace(/\s+/g, '_')]
        );
        clientId = newClient.insertId;
      }
    }
    
    // Créer ou retrouver le produit
    let produitId = null;
    if (nom_produit) {
      // Vérifier si le produit existe déjà
      const [existingProduit] = await pool.execute(
        'SELECT id FROM produits WHERE nom = ?',
        [nom_produit]
      );
      
      if (existingProduit.length > 0) {
        produitId = existingProduit[0].id;
      } else {
        // Créer un nouveau produit
        const [newProduit] = await pool.execute(
          'INSERT INTO produits (nom, code_produit) VALUES (?, ?)',
          [nom_produit, nom_produit.toUpperCase().replace(/\s+/g, '_')]
        );
        produitId = newProduit.insertId;
      }
    }
    
    // Ajouter la relation navire-client
    const [result] = await pool.execute(
      'INSERT INTO navire_clients (navire_id, client_id, produit_id, tonnage, date_chargement) VALUES (?, ?, ?, ?, ?)',
      [navireId, clientId, produitId, quantite, date_chargement]
    );
    return result.insertId;
  }

  // Obtenir les clients d'un navire
  static async getClients(navireId) {
    const [rows] = await pool.execute(`
      SELECT 
        nc.*,
        c.nom as client_nom,
        c.code_client,
        p.nom as produit_nom,
        p.code_produit
      FROM navire_clients nc
      JOIN clients c ON nc.client_id = c.id
      LEFT JOIN produits p ON nc.produit_id = p.id
      WHERE nc.navire_id = ?
      ORDER BY nc.date_chargement
    `, [navireId]);
    return rows;
  }

  // Supprimer un client d'un navire
  static async removeClient(navireClientId) {
    const [result] = await pool.execute(
      'DELETE FROM navire_clients WHERE id = ?',
      [navireClientId]
    );
    return result.affectedRows > 0;
  }

  // Obtenir un navire avec ses clients
  static async findByIdWithClients(id) {
    const navire = await this.findById(id);
    if (navire) {
      navire.clients = await this.getClients(id);
    }
    return navire;
  }
}

module.exports = NavireModel;