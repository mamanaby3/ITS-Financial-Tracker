const { pool } = require('../config/database');

class ClientModel {
  // Obtenir tous les clients
  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM clients ORDER BY nom ASC'
    );
    return rows;
  }

  // Obtenir un client par ID
  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Créer un nouveau client
  static async create(clientData) {
    const { nom, code_client, email, telephone, adresse } = clientData;
    const [result] = await pool.execute(
      'INSERT INTO clients (nom, code_client, email, telephone, adresse) VALUES (?, ?, ?, ?, ?)',
      [nom, code_client, email, telephone, adresse]
    );
    return result.insertId;
  }

  // Mettre à jour un client
  static async update(id, clientData) {
    const { nom, code_client, email, telephone, adresse } = clientData;
    await pool.execute(
      'UPDATE clients SET nom = ?, code_client = ?, email = ?, telephone = ?, adresse = ? WHERE id = ?',
      [nom, code_client, email, telephone, adresse, id]
    );
  }

  // Supprimer un client
  static async delete(id) {
    await pool.execute('DELETE FROM clients WHERE id = ?', [id]);
  }

  // Obtenir les navires d'un client
  static async getNaviresByClient(clientId) {
    const [rows] = await pool.execute(`
      SELECT 
        n.*,
        nc.tonnage,
        nc.date_chargement,
        p.nom as produit_nom
      FROM navire_clients nc
      JOIN navires n ON nc.navire_id = n.id
      LEFT JOIN produits p ON nc.produit_id = p.id
      WHERE nc.client_id = ?
      ORDER BY nc.date_chargement DESC
    `, [clientId]);
    return rows;
  }
}

module.exports = ClientModel;