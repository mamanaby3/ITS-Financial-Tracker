const { pool } = require('../config/database');

class DepenseModel {
  static async create(depenseData) {
    const { navire_id, type_depense_id, montant, date_depense, description } = depenseData;
    const [result] = await pool.execute(
      'INSERT INTO depenses_navires (navire_id, type_depense_id, montant, date_depense, description) VALUES (?, ?, ?, ?, ?)',
      [navire_id, type_depense_id, montant, date_depense, description]
    );
    return { id: result.insertId, ...depenseData };
  }

  static async findByNavire(navireId) {
    const [rows] = await pool.execute(`
      SELECT 
        dn.*,
        td.nom as type_depense_nom,
        td.code
      FROM depenses_navires dn
      JOIN types_depenses td ON dn.type_depense_id = td.id
      WHERE dn.navire_id = ?
      ORDER BY dn.date_depense DESC
    `, [navireId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM depenses_navires WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, depenseData) {
    const { type_depense_id, montant, date_depense, description } = depenseData;
    const [result] = await pool.execute(
      'UPDATE depenses_navires SET type_depense_id = ?, montant = ?, date_depense = ?, description = ? WHERE id = ?',
      [type_depense_id, montant, date_depense, description, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM depenses_navires WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getTypesDepenses() {
    const [rows] = await pool.execute(
      'SELECT * FROM types_depenses ORDER BY nom'
    );
    return rows;
  }

  static async getTotalByNavire(navireId) {
    const [rows] = await pool.execute(
      'SELECT COALESCE(SUM(montant), 0) as total FROM depenses_navires WHERE navire_id = ?',
      [navireId]
    );
    return rows[0].total;
  }

  static async getDepensesByType(navireId) {
    const [rows] = await pool.execute(`
      SELECT 
        td.nom as type_depense,
        td.code,
        SUM(dn.montant) as total
      FROM depenses_navires dn
      JOIN types_depenses td ON dn.type_depense_id = td.id
      WHERE dn.navire_id = ?
      GROUP BY td.id, td.nom, td.code
      ORDER BY total DESC
    `, [navireId]);
    return rows;
  }
}

module.exports = DepenseModel;