// Nouveau format Excel - Compte de Résultat
const generateCompteResultatExcel = async (annee, mois, resultat, details, stats) => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'International Trading & Shipping';
  workbook.created = new Date();
  
  // Feuille principale - Compte de Résultat
  const sheet = workbook.addWorksheet('Compte de Résultat');
  
  // Configuration des colonnes - une pour les libellés + une par navire
  const columns = [
    { header: '', key: 'libelle', width: 35 }
  ];
  
  // Ajouter une colonne pour chaque navire
  details.forEach((navire, index) => {
    columns.push({
      header: navire.nom,
      key: `navire_${navire.id}`,
      width: 20
    });
  });
  
  // Ajouter une colonne pour le total
  columns.push({
    header: 'TOTAL',
    key: 'total',
    width: 20
  });
  
  sheet.columns = columns;
  
  // Titre principal
  const nbCols = columns.length;
  sheet.mergeCells(1, 1, 1, nbCols);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = 'International Trading & Shipping';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF003366' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;
  
  // Sous-titre
  sheet.mergeCells(2, 1, 2, nbCols);
  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = `COMPTE DE RÉSULTAT ${mois}/${annee}`;
  subtitleCell.font = { name: 'Arial', size: 14, bold: true };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(2).height = 25;
  
  // Ligne vide
  sheet.addRow([]);
  
  // En-tête du tableau avec nom du navire (ligne 4)
  const headerRow = sheet.getRow(4);
  headerRow.getCell(1).value = 'DÉSIGNATION';
  details.forEach((navire, index) => {
    headerRow.getCell(index + 2).value = navire.nom;
  });
  headerRow.getCell(nbCols).value = 'TOTAL';
  
  // Style pour l'en-tête principal
  for (let i = 1; i <= nbCols; i++) {
    const cell = headerRow.getCell(i);
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  headerRow.height = 25;
  
  // Ligne 5: Clients
  const clientsRow = sheet.getRow(5);
  clientsRow.getCell(1).value = 'Clients:';
  clientsRow.getCell(1).font = { name: 'Arial', size: 10, italic: true };
  clientsRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
  details.forEach((navire, index) => {
    const cell = clientsRow.getCell(index + 2);
    cell.value = navire.clients_noms || '-';
    cell.font = { name: 'Arial', size: 9 };
    cell.alignment = { horizontal: 'center', wrapText: true };
    cell.border = {
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  clientsRow.height = 20;
  
  // Ligne 6: Produits et tonnages
  const produitsRow = sheet.getRow(6);
  produitsRow.getCell(1).value = 'Produits:';
  produitsRow.getCell(1).font = { name: 'Arial', size: 10, italic: true };
  produitsRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
  details.forEach((navire, index) => {
    const cell = produitsRow.getCell(index + 2);
    cell.value = navire.produits_tonnages || '-';
    cell.font = { name: 'Arial', size: 9 };
    cell.alignment = { horizontal: 'center', wrapText: true };
    cell.border = {
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };
  });
  produitsRow.height = 20;
  
  let currentRow = 7;
  
  // SECTION RECETTES
  sheet.addRow(['RECETTES']);
  const recettesHeaderRow = sheet.getRow(currentRow);
  recettesHeaderRow.getCell(1).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF003366' } };
  recettesHeaderRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
  currentRow++;
  
  // Grouper les recettes par type
  const recettesParType = {};
  details.forEach(navire => {
    navire.detail_recettes.forEach(recette => {
      if (!recettesParType[recette.type]) {
        recettesParType[recette.type] = {};
      }
      if (!recettesParType[recette.type][navire.id]) {
        recettesParType[recette.type][navire.id] = 0;
      }
      recettesParType[recette.type][navire.id] += recette.montant || 0;
    });
  });
  
  // Afficher les recettes par type
  Object.keys(recettesParType).sort().forEach(type => {
    const row = sheet.addRow([]);
    row.getCell(1).value = `  ${type}`;
    let totalType = 0;
    
    details.forEach((navire, index) => {
      const montant = recettesParType[type][navire.id] || 0;
      row.getCell(index + 2).value = montant;
      row.getCell(index + 2).numFmt = '#,##0';
      totalType += montant;
    });
    
    row.getCell(nbCols).value = totalType;
    row.getCell(nbCols).numFmt = '#,##0';
    row.getCell(nbCols).font = { bold: true };
    
    currentRow++;
  });
  
  // Total Recettes
  sheet.addRow([]);
  const totalRecettesRow = sheet.getRow(currentRow);
  totalRecettesRow.getCell(1).value = 'TOTAL RECETTES';
  totalRecettesRow.getCell(1).font = { name: 'Arial', size: 11, bold: true };
  totalRecettesRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
  
  let grandTotalRecettes = 0;
  details.forEach((navire, index) => {
    totalRecettesRow.getCell(index + 2).value = navire.total_recettes || 0;
    totalRecettesRow.getCell(index + 2).numFmt = '#,##0';
    totalRecettesRow.getCell(index + 2).font = { bold: true };
    totalRecettesRow.getCell(index + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
    grandTotalRecettes += navire.total_recettes || 0;
  });
  
  totalRecettesRow.getCell(nbCols).value = grandTotalRecettes;
  totalRecettesRow.getCell(nbCols).numFmt = '#,##0';
  totalRecettesRow.getCell(nbCols).font = { bold: true };
  totalRecettesRow.getCell(nbCols).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
  currentRow++;
  
  // Ligne vide
  sheet.addRow([]);
  currentRow++;
  
  // SECTION DÉPENSES
  sheet.addRow(['DÉPENSES']);
  const depensesHeaderRow = sheet.getRow(currentRow);
  depensesHeaderRow.getCell(1).font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF003366' } };
  depensesHeaderRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
  currentRow++;
  
  // Grouper les dépenses par type
  const depensesParType = {};
  details.forEach(navire => {
    navire.detail_depenses.forEach(depense => {
      if (!depensesParType[depense.type]) {
        depensesParType[depense.type] = {};
      }
      if (!depensesParType[depense.type][navire.id]) {
        depensesParType[depense.type][navire.id] = 0;
      }
      depensesParType[depense.type][navire.id] += depense.montant || 0;
    });
  });
  
  // Afficher les dépenses par type
  Object.keys(depensesParType).sort().forEach(type => {
    const row = sheet.addRow([]);
    row.getCell(1).value = `  ${type}`;
    let totalType = 0;
    
    details.forEach((navire, index) => {
      const montant = depensesParType[type][navire.id] || 0;
      row.getCell(index + 2).value = montant;
      row.getCell(index + 2).numFmt = '#,##0';
      totalType += montant;
    });
    
    row.getCell(nbCols).value = totalType;
    row.getCell(nbCols).numFmt = '#,##0';
    row.getCell(nbCols).font = { bold: true };
    
    currentRow++;
  });
  
  // Total Dépenses
  sheet.addRow([]);
  const totalDepensesRow = sheet.getRow(currentRow);
  totalDepensesRow.getCell(1).value = 'TOTAL DÉPENSES';
  totalDepensesRow.getCell(1).font = { name: 'Arial', size: 11, bold: true };
  totalDepensesRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
  
  let grandTotalDepenses = 0;
  details.forEach((navire, index) => {
    totalDepensesRow.getCell(index + 2).value = navire.total_depenses || 0;
    totalDepensesRow.getCell(index + 2).numFmt = '#,##0';
    totalDepensesRow.getCell(index + 2).font = { bold: true };
    totalDepensesRow.getCell(index + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
    grandTotalDepenses += navire.total_depenses || 0;
  });
  
  totalDepensesRow.getCell(nbCols).value = grandTotalDepenses;
  totalDepensesRow.getCell(nbCols).numFmt = '#,##0';
  totalDepensesRow.getCell(nbCols).font = { bold: true };
  totalDepensesRow.getCell(nbCols).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
  currentRow++;
  
  // Ligne vide
  sheet.addRow([]);
  currentRow++;
  
  // RÉSULTAT NET PAR NAVIRE
  sheet.addRow([]);
  const resultatNetRow = sheet.getRow(currentRow);
  resultatNetRow.getCell(1).value = 'RÉSULTAT NET PAR NAVIRE';
  resultatNetRow.getCell(1).font = { name: 'Arial', size: 12, bold: true };
  resultatNetRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
  
  let totalResultatNet = 0;
  details.forEach((navire, index) => {
    const resultatNet = (navire.total_recettes || 0) - (navire.total_depenses || 0);
    resultatNetRow.getCell(index + 2).value = resultatNet;
    resultatNetRow.getCell(index + 2).numFmt = '#,##0';
    resultatNetRow.getCell(index + 2).font = { bold: true, color: { argb: resultatNet >= 0 ? 'FF008000' : 'FFFF0000' } };
    resultatNetRow.getCell(index + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
    totalResultatNet += resultatNet;
  });
  
  resultatNetRow.getCell(nbCols).value = totalResultatNet;
  resultatNetRow.getCell(nbCols).numFmt = '#,##0';
  resultatNetRow.getCell(nbCols).font = { bold: true, color: { argb: totalResultatNet >= 0 ? 'FF008000' : 'FFFF0000' } };
  resultatNetRow.getCell(nbCols).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
  currentRow++;
  
  // Ligne vide
  sheet.addRow([]);
  sheet.addRow([]);
  currentRow += 2;
  
  // CHARGES DE FONCTIONNEMENT
  sheet.addRow([]);
  const chargesRow = sheet.getRow(currentRow);
  chargesRow.getCell(1).value = 'CHARGES DE FONCTIONNEMENT';
  chargesRow.getCell(1).font = { name: 'Arial', size: 11, bold: true };
  chargesRow.getCell(nbCols).value = resultat?.total_charges_fonctionnement || 0;
  chargesRow.getCell(nbCols).numFmt = '#,##0';
  chargesRow.getCell(nbCols).font = { bold: true };
  currentRow++;
  
  // RÉSULTAT GLOBAL
  sheet.addRow([]);
  const resultatGlobalRow = sheet.getRow(currentRow);
  resultatGlobalRow.getCell(1).value = 'RÉSULTAT GLOBAL';
  resultatGlobalRow.getCell(1).font = { name: 'Arial', size: 14, bold: true };
  resultatGlobalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };
  resultatGlobalRow.getCell(1).font.color = { argb: 'FFFFFFFF' };
  
  const resultatGlobal = totalResultatNet - (resultat?.total_charges_fonctionnement || 0);
  resultatGlobalRow.getCell(nbCols).value = resultatGlobal;
  resultatGlobalRow.getCell(nbCols).numFmt = '#,##0';
  resultatGlobalRow.getCell(nbCols).font = { 
    size: 14, 
    bold: true, 
    color: { argb: resultatGlobal >= 0 ? 'FF008000' : 'FFFF0000' } 
  };
  resultatGlobalRow.getCell(nbCols).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
  
  // Ajouter des bordures à toutes les cellules avec données
  for (let i = 4; i <= currentRow; i++) {
    for (let j = 1; j <= nbCols; j++) {
      const cell = sheet.getCell(i, j);
      if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }
  }
  
  // Figer les panneaux (première colonne et premières lignes)
  sheet.views = [
    {
      state: 'frozen',
      xSplit: 1,
      ySplit: 4,
      topLeftCell: 'B5',
      activeCell: 'B5'
    }
  ];
  
  return workbook;
};

module.exports = { generateCompteResultatExcel };