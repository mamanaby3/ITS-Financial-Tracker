const { pool } = require('../config/database');

class RecetteModel {
  static async create(recetteData) {
    const { navire_id, type_prestation_id, montant, date_recette, description } = recetteData;
    const [result] = await pool.execute(
      'INSERT INTO recettes_navires (navire_id, type_prestation_id, montant, date_recette, description) VALUES (?, ?, ?, ?, ?)',
      [navire_id, type_prestation_id, montant, date_recette, description]
    );
    return { id: result.insertId, ...recetteData };
  }

  static async findByNavire(navireId) {
    const [rows] = await pool.execute(`
      SELECT 
        rn.*,
        tp.nom as type_prestation_nom,
        tp.categorie
      FROM recettes_navires rn
      JOIN types_prestations tp ON rn.type_prestation_id = tp.id
      WHERE rn.navire_id = ?
      ORDER BY rn.date_recette DESC
    `, [navireId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM recettes_navires WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, recetteData) {
    const { type_prestation_id, montant, date_recette, description } = recetteData;
    const [result] = await pool.execute(
      'UPDATE recettes_navires SET type_prestation_id = ?, montant = ?, date_recette = ?, description = ? WHERE id = ?',
      [type_prestation_id, montant, date_recette, description, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM recettes_navires WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getTypesPrestations() {
    const [rows] = await pool.execute(
      'SELECT * FROM types_prestations ORDER BY categorie, nom'
    );
    return rows;
  }

  static async getTotalByNavire(navireId) {
    const [rows] = await pool.execute(
      'SELECT COALESCE(SUM(montant), 0) as total FROM recettes_navires WHERE navire_id = ?',
      [navireId]
    );
    return rows[0].total;
  }
}

module.exports = RecetteModel;