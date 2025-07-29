const { pool } = require('../config/database');

class RapportModel {
  static async getResultatMensuel(annee, mois) {
    const [rows] = await pool.execute(`
      SELECT 
        vr.annee,
        vr.mois,
        vr.nombre_navires,
        vr.total_recettes,
        vr.total_depenses,
        vr.resultat_net_navires,
        vr.total_charges_fonctionnement,
        vr.resultat_global
      FROM vue_resultats_mensuels vr
      WHERE vr.annee = ? AND vr.mois = ?
    `, [annee, mois]);
    return rows[0];
  }

  static async getResultatsAnnuels(annee) {
    const [rows] = await pool.execute(`
      SELECT 
        vr.annee,
        vr.mois,
        vr.nombre_navires,
        vr.total_recettes,
        vr.total_depenses,
        vr.resultat_net_navires,
        vr.total_charges_fonctionnement,
        vr.resultat_global
      FROM vue_resultats_mensuels vr
      WHERE vr.annee = ?
      ORDER BY vr.mois
    `, [annee]);
    return rows;
  }

  static async getDetailsNaviresMois(annee, mois) {
    const [rows] = await pool.execute(`
      SELECT 
        n.id,
        n.nom,
        n.numero_imo,
        n.date_arrivee,
        n.date_depart,
        n.statut,
        n.tonnage_total,
        GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ') as clients_noms,
        GROUP_CONCAT(DISTINCT CONCAT(p.nom, ' (', nc.tonnage, 't)') ORDER BY p.nom SEPARATOR ', ') as produits_tonnages,
        COALESCE(r.total_recettes, 0) as total_recettes,
        COALESCE(d.total_depenses, 0) as total_depenses,
        (COALESCE(r.total_recettes, 0) - COALESCE(d.total_depenses, 0)) as resultat_net,
        r.detail_recettes,
        d.detail_depenses
      FROM navires n
      LEFT JOIN navire_clients nc ON n.id = nc.navire_id
      LEFT JOIN clients c ON nc.client_id = c.id
      LEFT JOIN produits p ON nc.produit_id = p.id
      LEFT JOIN (
        SELECT 
          navire_id,
          SUM(montant) as total_recettes,
          CONCAT('[', 
            GROUP_CONCAT(
              CONCAT(
                '{"type":"', tp.nom, 
                '","categorie":"', tp.categorie,
                '","montant":', rn.montant,
                ',"date":"', rn.date_recette, '"}'
              )
              SEPARATOR ','
            ), 
          ']') as detail_recettes
        FROM recettes_navires rn
        JOIN types_prestations tp ON rn.type_prestation_id = tp.id
        GROUP BY navire_id
      ) r ON n.id = r.navire_id
      LEFT JOIN (
        SELECT 
          navire_id,
          SUM(montant) as total_depenses,
          CONCAT('[', 
            GROUP_CONCAT(
              CONCAT(
                '{"type":"', td.nom,
                '","code":"', td.code,
                '","montant":', dn.montant,
                ',"date":"', dn.date_depense, '"}'
              )
              SEPARATOR ','
            ), 
          ']') as detail_depenses
        FROM depenses_navires dn
        JOIN types_depenses td ON dn.type_depense_id = td.id
        GROUP BY navire_id
      ) d ON n.id = d.navire_id
      WHERE YEAR(n.date_arrivee) = ? AND MONTH(n.date_arrivee) = ?
      GROUP BY n.id, n.nom, n.numero_imo, n.date_arrivee, n.date_depart, n.statut, n.tonnage_total,
               r.total_recettes, d.total_depenses, r.detail_recettes, d.detail_depenses
      ORDER BY n.date_arrivee
    `, [annee, mois]);
    return rows;
  }

  static async getEvolutionMensuelle(annee) {
    const [rows] = await pool.execute(`
      SELECT 
        mois,
        COUNT(DISTINCT navire_id) as nombre_navires,
        SUM(total_recettes) as total_recettes,
        SUM(total_depenses) as total_depenses,
        SUM(resultat_net) as resultat_net_navires,
        MAX(total_charges) as total_charges_fonctionnement,
        (SUM(resultat_net) - MAX(total_charges)) as resultat_global
      FROM (
        SELECT 
          MONTH(n.date_arrivee) as mois,
          n.id as navire_id,
          COALESCE(SUM(rn.montant), 0) as total_recettes,
          0 as total_depenses,
          COALESCE(SUM(rn.montant), 0) as resultat_net,
          0 as total_charges
        FROM navires n
        LEFT JOIN recettes_navires rn ON n.id = rn.navire_id
        WHERE YEAR(n.date_arrivee) = ?
        GROUP BY MONTH(n.date_arrivee), n.id
        
        UNION ALL
        
        SELECT 
          MONTH(n.date_arrivee) as mois,
          n.id as navire_id,
          0 as total_recettes,
          COALESCE(SUM(dn.montant), 0) as total_depenses,
          -COALESCE(SUM(dn.montant), 0) as resultat_net,
          0 as total_charges
        FROM navires n
        LEFT JOIN depenses_navires dn ON n.id = dn.navire_id
        WHERE YEAR(n.date_arrivee) = ?
        GROUP BY MONTH(n.date_arrivee), n.id
        
        UNION ALL
        
        SELECT 
          cf.mois,
          0 as navire_id,
          0 as total_recettes,
          0 as total_depenses,
          0 as resultat_net,
          SUM(cf.montant) as total_charges
        FROM charges_fonctionnement cf
        WHERE cf.annee = ?
        GROUP BY cf.mois
      ) t
      GROUP BY mois
      ORDER BY mois
    `, [annee, annee, annee]);
    return rows;
  }

  static async getStatistiquesGenerales(annee, mois) {
    const [recettesParType] = await pool.execute(`
      SELECT 
        tp.categorie,
        tp.nom,
        COUNT(rn.id) as nombre_operations,
        SUM(rn.montant) as total
      FROM recettes_navires rn
      JOIN types_prestations tp ON rn.type_prestation_id = tp.id
      JOIN navires n ON rn.navire_id = n.id
      WHERE YEAR(n.date_arrivee) = ? AND MONTH(n.date_arrivee) = ?
      GROUP BY tp.id, tp.categorie, tp.nom
      ORDER BY total DESC
    `, [annee, mois]);

    const [depensesParType] = await pool.execute(`
      SELECT 
        td.code,
        td.nom,
        COUNT(dn.id) as nombre_operations,
        SUM(dn.montant) as total
      FROM depenses_navires dn
      JOIN types_depenses td ON dn.type_depense_id = td.id
      JOIN navires n ON dn.navire_id = n.id
      WHERE YEAR(n.date_arrivee) = ? AND MONTH(n.date_arrivee) = ?
      GROUP BY td.id, td.code, td.nom
      ORDER BY total DESC
    `, [annee, mois]);

    const [chargesParType] = await pool.execute(`
      SELECT 
        tcf.code,
        tcf.nom,
        cf.montant as total
      FROM charges_fonctionnement cf
      JOIN types_charges_fonctionnement tcf ON cf.type_charge_id = tcf.id
      WHERE cf.annee = ? AND cf.mois = ?
      ORDER BY cf.montant DESC
    `, [annee, mois]);

    return {
      recettesParType,
      depensesParType,
      chargesParType
    };
  }
}

module.exports = RapportModel;