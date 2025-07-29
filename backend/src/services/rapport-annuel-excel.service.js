const ExcelJS = require('exceljs');

const generateRapportAnnuelExcel = async (annee, rapport, developerName = '') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = developerName || 'International Trading & Services';
  workbook.created = new Date();
  workbook.lastModifiedBy = developerName || 'ITS Financial Tracker';
  workbook.company = 'International Trading & Services';
  
  // Log pour debug
  console.log('Génération Excel pour année:', annee);
  console.log('Structure du rapport:', Object.keys(rapport || {}));
  
  // Feuille 1: Résumé Annuel
  const resumeSheet = workbook.addWorksheet('Résumé Annuel');
  createResumeSheet(resumeSheet, annee, rapport);
  
  // Feuille 2: Évolution Mensuelle
  const evolutionSheet = workbook.addWorksheet('Évolution Mensuelle');
  createEvolutionSheet(evolutionSheet, rapport.evolutionMensuelle || []);
  
  // Feuille 3: Liste des Navires
  const naviresSheet = workbook.addWorksheet('Liste des Navires');
  createNaviresSheet(naviresSheet, rapport.tousNavires || rapport.topNavires || []);
  
  // Feuille 4: Statistiques
  const statsSheet = workbook.addWorksheet('Statistiques');
  createStatistiquesSheet(statsSheet, rapport.statistiques || {});
  
  // Feuille 5: Top Clients
  const clientsSheet = workbook.addWorksheet('Top Clients');
  createTopClientsSheet(clientsSheet, rapport.topClients || []);
  
  // Feuille 6: Top Produits
  const produitsSheet = workbook.addWorksheet('Top Produits');
  createTopProduitsSheet(produitsSheet, rapport.topProduits || []);
  
  return workbook;
};

function createResumeSheet(sheet, annee, rapport) {
  // Configuration des colonnes
  sheet.columns = [
    { header: 'Mois', key: 'mois', width: 15 },
    { header: 'Nombre Navires', key: 'nombre_navires', width: 15 },
    { header: 'Recettes', key: 'recettes', width: 20 },
    { header: 'Dépenses', key: 'depenses', width: 20 },
    { header: 'Résultat Navires', key: 'resultat_navires', width: 20 },
    { header: 'Charges', key: 'charges', width: 20 },
    { header: 'Résultat Global', key: 'resultat_global', width: 20 }
  ];
  
  // Titre
  sheet.mergeCells('A1:G1');
  sheet.getCell('A1').value = `RAPPORT ANNUEL ${annee}`;
  sheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF003366' } };
  sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;
  
  // Sous-titre avec totaux
  sheet.mergeCells('A2:G2');
  const total = rapport.totalAnnuel || {};
  sheet.getCell('A2').value = `Total: ${total.nombre_navires_total || 0} navires | Recettes: ${formatCurrency(total.total_recettes_annuel)} | Résultat: ${formatCurrency(total.resultat_global_annuel)}`;
  sheet.getCell('A2').font = { size: 12, italic: true };
  sheet.getCell('A2').alignment = { horizontal: 'center' };
  
  sheet.addRow([]);
  
  // En-têtes
  const headerRow = sheet.getRow(4);
  sheet.columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
    headerRow.getCell(index + 1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.getCell(index + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
    headerRow.getCell(index + 1).alignment = { horizontal: 'center' };
  });
  
  // Données mensuelles
  const evolutionData = rapport.evolutionMensuelle || rapport.resumeAnnuel || [];
  evolutionData.forEach((mois, index) => {
    const row = sheet.addRow({
      mois: mois.nom_mois || `Mois ${mois.mois}`,
      nombre_navires: mois.nombre_navires || 0,
      recettes: mois.total_recettes || 0,
      depenses: mois.total_depenses || 0,
      resultat_navires: mois.resultat_net_navires || 0,
      charges: mois.charges_fonctionnement || 0,
      resultat_global: mois.resultat_global || 0
    });
    
    // Coloration conditionnelle pour le résultat
    if (mois.resultat_global < 0) {
      row.getCell('resultat_global').font = { color: { argb: 'FFFF0000' } };
    } else {
      row.getCell('resultat_global').font = { color: { argb: 'FF008000' } };
    }
  });
  
  // Ligne de total
  sheet.addRow([]); // Ligne vide avant le total
  const totalRow = sheet.addRow({
    mois: 'TOTAL ANNUEL',
    nombre_navires: total.nombre_navires_total || 0,
    recettes: total.total_recettes_annuel || 0,
    depenses: total.total_depenses_annuel || 0,
    resultat_navires: total.resultat_net_navires_annuel || 0,
    charges: total.charges_fonctionnement_annuel || 0,
    resultat_global: total.resultat_global_annuel || 0
  });
  
  totalRow.font = { bold: true };
  totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
  
  // Format des nombres pour toutes les colonnes numériques
  formatNumberColumns(sheet, ['B', 'C', 'D', 'E', 'F', 'G'], 5);
}

function createEvolutionSheet(sheet, evolution) {
  sheet.columns = [
    { header: 'Mois', key: 'mois', width: 15 },
    { header: 'Navires', key: 'navires', width: 12 },
    { header: 'Recettes', key: 'recettes', width: 20 },
    { header: 'Dépenses', key: 'depenses', width: 20 },
    { header: 'Résultat', key: 'resultat', width: 20 }
  ];
  
  // Titre
  sheet.mergeCells('A1:E1');
  sheet.getCell('A1').value = 'ÉVOLUTION MENSUELLE';
  sheet.getCell('A1').font = { size: 16, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center' };
  
  sheet.addRow([]);
  
  // En-têtes
  const headerRow = sheet.getRow(3);
  sheet.columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
    headerRow.getCell(index + 1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.getCell(index + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
  });
  
  // Données
  if (evolution && evolution.length > 0) {
    evolution.forEach(mois => {
      sheet.addRow({
        mois: mois.nom_mois || '',
        navires: mois.nombre_navires || 0,
        recettes: mois.total_recettes || 0,
        depenses: mois.total_depenses || 0,
        resultat: mois.resultat_global || 0
      });
    });
  }
  
  formatNumberColumns(sheet, ['C', 'D', 'E'], 4);
}

function createNaviresSheet(sheet, navires) {
  sheet.columns = [
    { header: 'Navire', key: 'nom', width: 25 },
    { header: 'N° IMO', key: 'imo', width: 15 },
    { header: 'Date Arrivée', key: 'date_arrivee', width: 15 },
    { header: 'Recettes', key: 'recettes', width: 20 },
    { header: 'Dépenses', key: 'depenses', width: 20 },
    { header: 'Résultat', key: 'resultat', width: 20 }
  ];
  
  // Titre
  sheet.mergeCells('A1:F1');
  sheet.getCell('A1').value = 'LISTE DES NAVIRES';
  sheet.getCell('A1').font = { size: 16, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center' };
  
  sheet.addRow([]);
  
  // En-têtes
  const headerRow = sheet.getRow(3);
  sheet.columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
    headerRow.getCell(index + 1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.getCell(index + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
  });
  
  // Données
  if (navires && navires.length > 0) {
    navires.forEach(navire => {
      const row = sheet.addRow({
        nom: navire.nom || '',
        imo: navire.numero_imo || '-',
        date_arrivee: navire.date_arrivee ? new Date(navire.date_arrivee) : null,
        recettes: navire.total_recettes || 0,
        depenses: navire.total_depenses || 0,
        resultat: navire.resultat_net || 0
      });
      
      // Coloration conditionnelle pour le résultat
      if (navire.resultat_net < 0) {
        row.getCell('resultat').font = { color: { argb: 'FFFF0000' } };
      } else {
        row.getCell('resultat').font = { color: { argb: 'FF008000' } };
      }
    });
  }
  
  // Format date
  sheet.getColumn('date_arrivee').numFmt = 'dd/mm/yyyy';
  formatNumberColumns(sheet, ['D', 'E', 'F'], 4);
}

function createStatistiquesSheet(sheet, stats) {
  if (!stats) return;
  
  // Titre
  sheet.mergeCells('A1:D1');
  sheet.getCell('A1').value = 'STATISTIQUES ANNUELLES';
  sheet.getCell('A1').font = { size: 16, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center' };
  
  sheet.addRow([]);
  
  // Section Recettes
  sheet.addRow(['RÉPARTITION DES RECETTES']);
  sheet.getRow(sheet.lastRow.number).font = { bold: true, size: 14 };
  
  sheet.addRow(['Type', 'Montant']);
  sheet.getRow(sheet.lastRow.number).font = { bold: true };
  
  if (stats.recettesParType && stats.recettesParType.length > 0) {
    stats.recettesParType.forEach(item => {
      sheet.addRow([item.nom || item.type || '', item.total || 0]);
    });
  }
  
  sheet.addRow([]);
  
  // Section Dépenses
  sheet.addRow(['RÉPARTITION DES DÉPENSES']);
  sheet.getRow(sheet.lastRow.number).font = { bold: true, size: 14 };
  
  sheet.addRow(['Type', 'Montant']);
  sheet.getRow(sheet.lastRow.number).font = { bold: true };
  
  if (stats.depensesParType && stats.depensesParType.length > 0) {
    stats.depensesParType.forEach(item => {
      sheet.addRow([item.nom || item.type || '', item.total || 0]);
    });
  }
  
  sheet.addRow([]);
  
  // Section Charges
  sheet.addRow(['RÉPARTITION DES CHARGES']);
  sheet.getRow(sheet.lastRow.number).font = { bold: true, size: 14 };
  
  sheet.addRow(['Type', 'Montant']);
  sheet.getRow(sheet.lastRow.number).font = { bold: true };
  
  if (stats.chargesParType && stats.chargesParType.length > 0) {
    stats.chargesParType.forEach(item => {
      sheet.addRow([item.nom || item.type || '', item.total || 0]);
    });
  }
  
  formatNumberColumns(sheet, ['B'], 4);
}

function createTopClientsSheet(sheet, clients) {
  sheet.columns = [
    { header: 'Rang', key: 'rang', width: 10 },
    { header: 'Client', key: 'nom', width: 30 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Nombre de navires', key: 'nombre_navires', width: 20 },
    { header: 'Tonnage total', key: 'tonnage_total', width: 20 },
    { header: 'Produits', key: 'produits', width: 30 }
  ];
  
  // Titre
  sheet.mergeCells('A1:F1');
  sheet.getCell('A1').value = 'TOP 10 CLIENTS';
  sheet.getCell('A1').font = { size: 16, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center' };
  
  sheet.addRow([]);
  
  // En-têtes
  const headerRow = sheet.getRow(3);
  sheet.columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
    headerRow.getCell(index + 1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.getCell(index + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
  });
  
  // Données
  if (clients && clients.length > 0) {
    clients.forEach((client, index) => {
      sheet.addRow({
        rang: index + 1,
        nom: client.nom || client.client || '',
        type: client.type || 'Armateur',
        nombre_navires: client.nombre_navires || 0,
        tonnage_total: client.tonnage_total || 0,
        produits: client.produits || '-'
      });
    });
  }
}

function createTopProduitsSheet(sheet, produits) {
  sheet.columns = [
    { header: 'Rang', key: 'rang', width: 10 },
    { header: 'Produit', key: 'nom', width: 30 },
    { header: 'Catégorie', key: 'categorie', width: 20 },
    { header: 'Nombre de navires', key: 'nombre_navires', width: 20 },
    { header: 'Nombre de clients', key: 'nombre_clients', width: 20 },
    { header: 'Tonnage total', key: 'tonnage_total', width: 20 }
  ];
  
  // Titre
  sheet.mergeCells('A1:F1');
  sheet.getCell('A1').value = 'TOP 10 PRODUITS';
  sheet.getCell('A1').font = { size: 16, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center' };
  
  sheet.addRow([]);
  
  // En-têtes
  const headerRow = sheet.getRow(3);
  sheet.columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
    headerRow.getCell(index + 1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.getCell(index + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
  });
  
  // Données
  if (produits && produits.length > 0) {
    produits.forEach((produit, index) => {
      sheet.addRow({
        rang: index + 1,
        nom: produit.nom || produit.produit || '',
        categorie: produit.categorie || 'Général',
        nombre_navires: produit.nombre_navires || 0,
        nombre_clients: produit.nombre_clients || 0,
        tonnage_total: produit.tonnage_total || 0
      });
    });
  }
}

// Fonctions utilitaires
function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(value || 0);
}

function formatNumberColumns(sheet, columns, startRow) {
  columns.forEach(col => {
    const column = sheet.getColumn(col);
    column.numFmt = '#,##0';
    column.alignment = { horizontal: 'right' };
  });
}

function parseStatData(jsonString) {
  try {
    return JSON.parse(jsonString || '[]');
  } catch {
    return [];
  }
}

module.exports = generateRapportAnnuelExcel;