const { pool } = require('../config/database');

class RapportAnnuelModel {
  // Obtenir le résumé annuel par mois
  static async getResultatAnnuelParMois(annee) {
    const [rows] = await pool.execute(`
      SELECT 
        MONTH(n.date_arrivee) as mois,
        MONTHNAME(n.date_arrivee) as nom_mois,
        COUNT(DISTINCT n.id) as nombre_navires,
        COALESCE(SUM(r.total_recettes), 0) as total_recettes,
        COALESCE(SUM(d.total_depenses), 0) as total_depenses,
        COALESCE(SUM(r.total_recettes), 0) - COALESCE(SUM(d.total_depenses), 0) as resultat_net_navires,
        COALESCE(cf.total_charges, 0) as charges_fonctionnement,
        (COALESCE(SUM(r.total_recettes), 0) - COALESCE(SUM(d.total_depenses), 0) - COALESCE(cf.total_charges, 0)) as resultat_global
      FROM navires n
      LEFT JOIN (
        SELECT navire_id, SUM(montant) as total_recettes
        FROM recettes_navires
        GROUP BY navire_id
      ) r ON n.id = r.navire_id
      LEFT JOIN (
        SELECT navire_id, SUM(montant) as total_depenses
        FROM depenses_navires
        GROUP BY navire_id
      ) d ON n.id = d.navire_id
      LEFT JOIN (
        SELECT 
          mois,
          annee,
          SUM(montant) as total_charges
        FROM charges_fonctionnement
        WHERE annee = ?
        GROUP BY annee, mois
      ) cf ON MONTH(n.date_arrivee) = cf.mois AND YEAR(n.date_arrivee) = cf.annee
      WHERE YEAR(n.date_arrivee) = ?
      GROUP BY MONTH(n.date_arrivee), MONTHNAME(n.date_arrivee), cf.total_charges
      ORDER BY mois
    `, [annee, annee]);
    
    return rows;
  }

  // Obtenir le total annuel
  static async getTotalAnnuel(annee) {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT n.id) as nombre_navires_total,
        COALESCE(SUM(r.total_recettes), 0) as total_recettes_annuel,
        COALESCE(SUM(d.total_depenses), 0) as total_depenses_annuel,
        COALESCE(SUM(r.total_recettes), 0) - COALESCE(SUM(d.total_depenses), 0) as resultat_net_navires_annuel,
        COALESCE(cf.total_charges, 0) as charges_fonctionnement_annuel,
        (COALESCE(SUM(r.total_recettes), 0) - COALESCE(SUM(d.total_depenses), 0) - COALESCE(cf.total_charges, 0)) as resultat_global_annuel
      FROM navires n
      LEFT JOIN (
        SELECT navire_id, SUM(montant) as total_recettes
        FROM recettes_navires
        GROUP BY navire_id
      ) r ON n.id = r.navire_id
      LEFT JOIN (
        SELECT navire_id, SUM(montant) as total_depenses
        FROM depenses_navires
        GROUP BY navire_id
      ) d ON n.id = d.navire_id
      CROSS JOIN (
        SELECT SUM(montant) as total_charges
        FROM charges_fonctionnement
        WHERE annee = ?
      ) cf
      WHERE YEAR(n.date_arrivee) = ?
    `, [annee, annee]);
    
    return rows[0];
  }

  // Obtenir les statistiques annuelles par type
  static async getStatistiquesAnnuelles(annee) {
    // Recettes par type pour l'année
    const [recettesParType] = await pool.execute(`
      SELECT 
        tp.nom,
        tp.categorie,
        COUNT(rn.id) as nombre_operations,
        SUM(rn.montant) as total
      FROM recettes_navires rn
      JOIN types_prestations tp ON rn.type_prestation_id = tp.id
      JOIN navires n ON rn.navire_id = n.id
      WHERE YEAR(n.date_arrivee) = ?
      GROUP BY tp.id, tp.nom, tp.categorie
      ORDER BY total DESC
    `, [annee]);

    // Dépenses par type pour l'année
    const [depensesParType] = await pool.execute(`
      SELECT 
        td.nom,
        td.code,
        COUNT(dn.id) as nombre_operations,
        SUM(dn.montant) as total
      FROM depenses_navires dn
      JOIN types_depenses td ON dn.type_depense_id = td.id
      JOIN navires n ON dn.navire_id = n.id
      WHERE YEAR(n.date_arrivee) = ?
      GROUP BY td.id, td.nom, td.code
      ORDER BY total DESC
    `, [annee]);

    // Charges par type pour l'année
    const [chargesParType] = await pool.execute(`
      SELECT 
        tc.nom,
        tc.code,
        COUNT(cf.id) as nombre_operations,
        SUM(cf.montant) as total
      FROM charges_fonctionnement cf
      JOIN types_charges_fonctionnement tc ON cf.type_charge_id = tc.id
      WHERE cf.annee = ?
      GROUP BY tc.id, tc.nom, tc.code
      ORDER BY total DESC
    `, [annee]);

    return {
      recettesParType,
      depensesParType,
      chargesParType
    };
  }

  // Obtenir le top des navires pour l'année
  static async getTopNaviresAnnuel(annee, limit = 10) {
    const [rows] = await pool.execute(`
      SELECT 
        n.id,
        n.nom,
        n.numero_imo,
        COUNT(DISTINCT nc.client_id) as nombre_clients,
        COALESCE(SUM(r.total_recettes), 0) as total_recettes,
        COALESCE(SUM(d.total_depenses), 0) as total_depenses,
        COALESCE(SUM(r.total_recettes), 0) - COALESCE(SUM(d.total_depenses), 0) as resultat_net
      FROM navires n
      LEFT JOIN navire_clients nc ON n.id = nc.navire_id
      LEFT JOIN (
        SELECT navire_id, SUM(montant) as total_recettes
        FROM recettes_navires
        GROUP BY navire_id
      ) r ON n.id = r.navire_id
      LEFT JOIN (
        SELECT navire_id, SUM(montant) as total_depenses
        FROM depenses_navires
        GROUP BY navire_id
      ) d ON n.id = d.navire_id
      WHERE YEAR(n.date_arrivee) = ?
      GROUP BY n.id, n.nom, n.numero_imo
      ORDER BY resultat_net DESC
      LIMIT ?
    `, [annee, limit]);
    
    return rows;
  }

  // Obtenir tous les navires de l'année avec détails complets
  static async getTousNaviresAnnuel(annee) {
    const [rows] = await pool.execute(`
      SELECT 
        n.id,
        n.nom,
        n.numero_imo,
        n.date_arrivee,
        n.date_depart,
        n.statut,
        n.tonnage_total,
        MONTH(n.date_arrivee) as mois,
        MONTHNAME(n.date_arrivee) as nom_mois,
        GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ') as clients,
        GROUP_CONCAT(DISTINCT CONCAT(p.nom, ' (', nc.tonnage, 't)') ORDER BY p.nom SEPARATOR ', ') as produits,
        COALESCE(r.total_recettes, 0) as total_recettes,
        COALESCE(d.total_depenses, 0) as total_depenses,
        (COALESCE(r.total_recettes, 0) - COALESCE(d.total_depenses, 0)) as resultat_net
      FROM navires n
      LEFT JOIN navire_clients nc ON n.id = nc.navire_id
      LEFT JOIN clients c ON nc.client_id = c.id
      LEFT JOIN produits p ON nc.produit_id = p.id
      LEFT JOIN (
        SELECT navire_id, SUM(montant) as total_recettes
        FROM recettes_navires
        GROUP BY navire_id
      ) r ON n.id = r.navire_id
      LEFT JOIN (
        SELECT navire_id, SUM(montant) as total_depenses
        FROM depenses_navires
        GROUP BY navire_id
      ) d ON n.id = d.navire_id
      WHERE YEAR(n.date_arrivee) = ?
      GROUP BY n.id, n.nom, n.numero_imo, n.date_arrivee, n.date_depart, n.statut, n.tonnage_total,
               r.total_recettes, d.total_depenses
      ORDER BY n.date_arrivee
    `, [annee]);
    
    return rows;
  }

  // Obtenir les statistiques des clients les plus fréquents
  static async getTopClientsAnnuel(annee, limit = 10) {
    const [rows] = await pool.execute(`
      SELECT 
        c.id,
        c.nom,
        c.code_client,
        c.email,
        c.telephone,
        COUNT(DISTINCT nc.navire_id) as nombre_navires,
        SUM(nc.tonnage) as tonnage_total,
        GROUP_CONCAT(DISTINCT p.nom ORDER BY p.nom SEPARATOR ', ') as produits
      FROM clients c
      JOIN navire_clients nc ON c.id = nc.client_id
      JOIN navires n ON nc.navire_id = n.id
      LEFT JOIN produits p ON nc.produit_id = p.id
      WHERE YEAR(n.date_arrivee) = ?
      GROUP BY c.id, c.nom, c.code_client, c.email, c.telephone
      ORDER BY nombre_navires DESC, tonnage_total DESC
      LIMIT ?
    `, [annee, limit]);
    
    return rows;
  }

  // Obtenir les statistiques des produits les plus transportés
  static async getTopProduitsAnnuel(annee, limit = 10) {
    const [rows] = await pool.execute(`
      SELECT 
        p.id,
        p.nom,
        p.code_produit,
        COUNT(DISTINCT nc.navire_id) as nombre_navires,
        COUNT(DISTINCT nc.client_id) as nombre_clients,
        SUM(nc.tonnage) as tonnage_total
      FROM produits p
      JOIN navire_clients nc ON p.id = nc.produit_id
      JOIN navires n ON nc.navire_id = n.id
      WHERE YEAR(n.date_arrivee) = ?
      GROUP BY p.id, p.nom, p.code_produit
      ORDER BY tonnage_total DESC, nombre_navires DESC
      LIMIT ?
    `, [annee, limit]);
    
    return rows;
  }

  // Obtenir l'évolution mensuelle des indicateurs clés
  static async getEvolutionMensuelleComplete(annee) {
    const [rows] = await pool.execute(`
      SELECT 
        m.mois,
        CASE m.mois
          WHEN 1 THEN 'Janvier'
          WHEN 2 THEN 'Février'
          WHEN 3 THEN 'Mars'
          WHEN 4 THEN 'Avril'
          WHEN 5 THEN 'Mai'
          WHEN 6 THEN 'Juin'
          WHEN 7 THEN 'Juillet'
          WHEN 8 THEN 'Août'
          WHEN 9 THEN 'Septembre'
          WHEN 10 THEN 'Octobre'
          WHEN 11 THEN 'Novembre'
          WHEN 12 THEN 'Décembre'
        END as nom_mois,
        COALESCE(nav.nombre_navires, 0) as nombre_navires,
        COALESCE(nav.total_recettes, 0) as total_recettes,
        COALESCE(nav.total_depenses, 0) as total_depenses,
        COALESCE(nav.resultat_net_navires, 0) as resultat_net_navires,
        COALESCE(cf.total_charges, 0) as charges_fonctionnement,
        (COALESCE(nav.resultat_net_navires, 0) - COALESCE(cf.total_charges, 0)) as resultat_global
      FROM (
        SELECT 1 as mois UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
        UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 
        UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      ) m
      LEFT JOIN (
        SELECT 
          MONTH(n.date_arrivee) as mois,
          COUNT(DISTINCT n.id) as nombre_navires,
          COALESCE(SUM(r.total_recettes), 0) as total_recettes,
          COALESCE(SUM(d.total_depenses), 0) as total_depenses,
          COALESCE(SUM(r.total_recettes), 0) - COALESCE(SUM(d.total_depenses), 0) as resultat_net_navires
        FROM navires n
        LEFT JOIN (
          SELECT navire_id, SUM(montant) as total_recettes
          FROM recettes_navires
          GROUP BY navire_id
        ) r ON n.id = r.navire_id
        LEFT JOIN (
          SELECT navire_id, SUM(montant) as total_depenses
          FROM depenses_navires
          GROUP BY navire_id
        ) d ON n.id = d.navire_id
        WHERE YEAR(n.date_arrivee) = ?
        GROUP BY MONTH(n.date_arrivee)
      ) nav ON m.mois = nav.mois
      LEFT JOIN (
        SELECT 
          mois,
          SUM(montant) as total_charges
        FROM charges_fonctionnement
        WHERE annee = ?
        GROUP BY mois
      ) cf ON m.mois = cf.mois
      ORDER BY m.mois
    `, [annee, annee]);
    
    return rows;
  }

  // Obtenir le rapport annuel complet
  static async getRapportAnnuelComplet(annee) {
    const resumeAnnuel = await this.getResultatAnnuelParMois(annee);
    const totalAnnuel = await this.getTotalAnnuel(annee);
    const statistiques = await this.getStatistiquesAnnuelles(annee);
    const topNavires = await this.getTopNaviresAnnuel(annee, 10);
    const topClients = await this.getTopClientsAnnuel(annee, 10);
    const topProduits = await this.getTopProduitsAnnuel(annee, 10);
    const evolutionMensuelle = await this.getEvolutionMensuelleComplete(annee);
    const tousNavires = await this.getTousNaviresAnnuel(annee);

    return {
      annee,
      resumeAnnuel,
      totalAnnuel,
      statistiques,
      topNavires,
      topClients,
      topProduits,
      evolutionMensuelle,
      tousNavires
    };
  }

  // Alias pour getResultatAnnuelParMois
  static async getResumeAnnuel(annee) {
    return await this.getResultatAnnuelParMois(annee);
  }

  // Alias pour getTopNaviresAnnuel
  static async getTopNavires(annee, limit = 10) {
    return await this.getTopNaviresAnnuel(annee, limit);
  }
}

module.exports = RapportAnnuelModel;