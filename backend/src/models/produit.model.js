const { pool } = require('../config/database');

class ProduitModel {
  // Obtenir tous les produits
  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM produits ORDER BY nom ASC'
    );
    return rows;
  }

  // Obtenir un produit par ID
  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM produits WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Créer un nouveau produit
  static async create(produitData) {
    const { nom, code_produit, description } = produitData;
    const [result] = await pool.execute(
      'INSERT INTO produits (nom, code_produit, description) VALUES (?, ?, ?)',
      [nom, code_produit, description]
    );
    return result.insertId;
  }

  // Mettre à jour un produit
  static async update(id, produitData) {
    const { nom, code_produit, description } = produitData;
    await pool.execute(
      'UPDATE produits SET nom = ?, code_produit = ?, description = ? WHERE id = ?',
      [nom, code_produit, description, id]
    );
  }

  // Supprimer un produit
  static async delete(id) {
    await pool.execute('DELETE FROM produits WHERE id = ?', [id]);
  }
}

module.exports = ProduitModel;