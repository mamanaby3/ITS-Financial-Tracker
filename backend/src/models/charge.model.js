const { pool } = require('../config/database');

class ChargeModel {
  static async create(chargeData) {
    const { type_charge_id, montant, mois, annee, description } = chargeData;
    const [result] = await pool.execute(
      'INSERT INTO charges_fonctionnement (type_charge_id, montant, mois, annee, description) VALUES (?, ?, ?, ?, ?)',
      [type_charge_id, montant, mois, annee, description]
    );
    return { id: result.insertId, ...chargeData };
  }

  static async findByMonth(annee, mois) {
    const [rows] = await pool.execute(`
      SELECT 
        cf.*,
        tcf.nom as type_charge_nom,
        tcf.code
      FROM charges_fonctionnement cf
      JOIN types_charges_fonctionnement tcf ON cf.type_charge_id = tcf.id
      WHERE cf.annee = ? AND cf.mois = ?
      ORDER BY tcf.nom
    `, [annee, mois]);
    return rows;
  }

  static async findByYear(annee) {
    const [rows] = await pool.execute(`
      SELECT 
        cf.*,
        tcf.nom as type_charge_nom,
        tcf.code
      FROM charges_fonctionnement cf
      JOIN types_charges_fonctionnement tcf ON cf.type_charge_id = tcf.id
      WHERE cf.annee = ?
      ORDER BY cf.mois, tcf.nom
    `, [annee]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM charges_fonctionnement WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, chargeData) {
    const { montant, description } = chargeData;
    const [result] = await pool.execute(
      'UPDATE charges_fonctionnement SET montant = ?, description = ? WHERE id = ?',
      [montant, description, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM charges_fonctionnement WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getTypesCharges() {
    const [rows] = await pool.execute(
      'SELECT * FROM types_charges_fonctionnement ORDER BY nom'
    );
    return rows;
  }

  static async getTotalByMonth(annee, mois) {
    const [rows] = await pool.execute(
      'SELECT COALESCE(SUM(montant), 0) as total FROM charges_fonctionnement WHERE annee = ? AND mois = ?',
      [annee, mois]
    );
    return rows[0].total;
  }

  static async getChargesByType(annee, mois) {
    const [rows] = await pool.execute(`
      SELECT 
        tcf.nom as type_charge,
        tcf.code,
        COALESCE(cf.montant, 0) as montant,
        cf.description
      FROM types_charges_fonctionnement tcf
      LEFT JOIN charges_fonctionnement cf 
        ON tcf.id = cf.type_charge_id 
        AND cf.annee = ? 
        AND cf.mois = ?
      ORDER BY tcf.nom
    `, [annee, mois]);
    return rows;
  }

  static async upsert(chargeData) {
    const { type_charge_id, montant, mois, annee, description } = chargeData;
    const [result] = await pool.execute(`
      INSERT INTO charges_fonctionnement (type_charge_id, montant, mois, annee, description) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE montant = VALUES(montant), description = VALUES(description)
    `, [type_charge_id, montant, mois, annee, description]);
    return { success: true, id: result.insertId || result.affectedRows };
  }
}

module.exports = ChargeModel;