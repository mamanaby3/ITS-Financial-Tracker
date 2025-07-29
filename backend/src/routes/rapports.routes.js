const express = require('express');
const router = express.Router();
const RapportModel = require('../models/rapport.model');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');
const { generateCompteResultatExcel } = require('./rapports-excel-new');

// Obtenir le résultat mensuel
router.get('/mensuel/:annee/:mois', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const resultat = await RapportModel.getResultatMensuel(annee, mois);
    res.json(resultat || {
      annee: parseInt(annee),
      mois: parseInt(mois),
      nombre_navires: 0,
      total_recettes: 0,
      total_depenses: 0,
      resultat_net_navires: 0,
      total_charges_fonctionnement: 0,
      resultat_global: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les détails des navires pour un mois
router.get('/mensuel/:annee/:mois/details', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const details = await RapportModel.getDetailsNaviresMois(annee, mois);
    
    // Parse JSON strings from GROUP_CONCAT result
    const parsedDetails = details.map(detail => {
      try {
        return {
          ...detail,
          detail_recettes: detail.detail_recettes ? JSON.parse(detail.detail_recettes) : [],
          detail_depenses: detail.detail_depenses ? JSON.parse(detail.detail_depenses) : []
        };
      } catch (parseError) {
        // If parsing fails, return empty arrays
        return {
          ...detail,
          detail_recettes: [],
          detail_depenses: []
        };
      }
    });
    
    res.json(parsedDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les statistiques par type pour un mois
router.get('/mensuel/:annee/:mois/statistiques', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const stats = await RapportModel.getStatistiquesGenerales(annee, mois);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les résultats annuels
router.get('/annuel/:annee', async (req, res) => {
  try {
    const resultats = await RapportModel.getResultatsAnnuels(req.params.annee);
    res.json(resultats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir l'évolution mensuelle
router.get('/evolution/:annee', async (req, res) => {
  try {
    const evolution = await RapportModel.getEvolutionMensuelle(req.params.annee);
    res.json(evolution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour le rapport annuel
router.get('/annuel/:annee', async (req, res) => {
  try {
    const { annee } = req.params;
    const RapportAnnuelModel = require('../models/rapport-annuel.model');
    
    const [resultatsParMois, totalAnnuel, stats] = await Promise.all([
      RapportAnnuelModel.getResultatAnnuelParMois(annee),
      RapportAnnuelModel.getTotalAnnuel(annee),
      RapportAnnuelModel.getStatistiquesAnnuelles(annee)
    ]);
    
    res.json({
      annee,
      resultatsParMois,
      totalAnnuel,
      statistiques: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exporter le rapport mensuel en Excel (nouveau format compte de résultat)
router.get('/export/excel/:annee/:mois', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const [resultat, detailsRaw, stats] = await Promise.all([
      RapportModel.getResultatMensuel(annee, mois),
      RapportModel.getDetailsNaviresMois(annee, mois),
      RapportModel.getStatistiquesGenerales(annee, mois)
    ]);
    
    // Parse JSON strings from GROUP_CONCAT result
    const details = detailsRaw.map(detail => {
      try {
        return {
          ...detail,
          detail_recettes: detail.detail_recettes ? JSON.parse(detail.detail_recettes) : [],
          detail_depenses: detail.detail_depenses ? JSON.parse(detail.detail_depenses) : []
        };
      } catch (parseError) {
        return {
          ...detail,
          detail_recettes: [],
          detail_depenses: []
        };
      }
    });

    // Générer le workbook avec le nouveau format
    const workbook = await generateCompteResultatExcel(annee, mois, resultat, details, stats);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_its_${annee}_${mois}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exporter le rapport mensuel en PDF
router.get('/export/pdf/:annee/:mois', async (req, res) => {
  try {
    const { annee, mois } = req.params;
    const [resultat, detailsRaw, stats] = await Promise.all([
      RapportModel.getResultatMensuel(annee, mois),
      RapportModel.getDetailsNaviresMois(annee, mois),
      RapportModel.getStatistiquesGenerales(annee, mois)
    ]);
    
    // Parse JSON strings from GROUP_CONCAT result
    const details = detailsRaw.map(detail => {
      try {
        return {
          ...detail,
          detail_recettes: detail.detail_recettes ? JSON.parse(detail.detail_recettes) : [],
          detail_depenses: detail.detail_depenses ? JSON.parse(detail.detail_depenses) : []
        };
      } catch (parseError) {
        return {
          ...detail,
          detail_recettes: [],
          detail_depenses: []
        };
      }
    });

    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_its_${annee}_${mois}.pdf`);
    doc.pipe(res);

    // Helper function to format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
    };

    // Logo et en-tête avec plus d'espace
    const logoPath = path.join(__dirname, '../assets/logo-its.png');
    try {
      doc.image(logoPath, 50, 20, { width: 70 });
    } catch (err) {
      // Si le logo n'est pas disponible, continuer sans
    }
    
    // Titre principal
    doc.fillColor('#003366');
    doc.fontSize(18).text('International Trading & Shipping', 200, 50, { align: 'center' });
    
    // Ligne de séparation
    doc.moveTo(50, 90).lineTo(550, 90).stroke('#003366');
    
    // Titre du rapport
    doc.fillColor('#000000');
    doc.fontSize(18).text(`Rapport Mensuel - ${mois}/${annee}`, 0, 110, { align: 'center' });
    
    // Tableau pour le résumé
    const startY = 150;
    const tableData = [
      ['Description', 'Montant (FCFA)'],
      ['Nombre de navires', resultat?.nombre_navires || 0],
      ['Total Recettes', formatCurrency(resultat?.total_recettes)],
      ['Total Dépenses', formatCurrency(resultat?.total_depenses)],
      ['Résultat Net Navires', formatCurrency(resultat?.resultat_net_navires)],
      ['Charges de Fonctionnement', formatCurrency(resultat?.total_charges_fonctionnement)],
      ['Résultat Global', formatCurrency(resultat?.resultat_global)]
    ];
    
    // Dessiner le tableau
    let currentY = startY;
    const col1Width = 250;
    const col2Width = 250;
    const rowHeight = 30;
    
    // En-tête du tableau
    doc.fillColor('#FFFFFF');
    doc.rect(50, currentY, col1Width, rowHeight).fillAndStroke('#003366', '#003366');
    doc.rect(50 + col1Width, currentY, col2Width, rowHeight).fillAndStroke('#003366', '#003366');
    
    doc.fillColor('#FFFFFF');
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(tableData[0][0], 60, currentY + 10, { width: col1Width - 20 });
    doc.text(tableData[0][1], 50 + col1Width + 10, currentY + 10, { width: col2Width - 20, align: 'right' });
    
    currentY += rowHeight;
    
    // Lignes du tableau
    doc.font('Helvetica');
    for (let i = 1; i < tableData.length; i++) {
      const isResultatGlobal = tableData[i][0] === 'Résultat Global';
      const fillColor = isResultatGlobal ? '#E6F2FF' : (i % 2 === 0 ? '#F5F5F5' : '#FFFFFF');
      
      // Remplir les cellules
      doc.fillColor(fillColor);
      doc.rect(50, currentY, col1Width, rowHeight).fillAndStroke(fillColor, '#666666');
      doc.rect(50 + col1Width, currentY, col2Width, rowHeight).fillAndStroke(fillColor, '#666666');
      
      // Texte
      doc.fillColor('#000000');
      doc.fontSize(11);
      
      if (isResultatGlobal) {
        doc.font('Helvetica-Bold');
        const resultColor = resultat?.resultat_global >= 0 ? '#008000' : '#FF0000';
        doc.fillColor('#000000');
        doc.text(tableData[i][0], 60, currentY + 10);
        doc.fillColor(resultColor);
        doc.text(tableData[i][1], 50 + col1Width + 10, currentY + 10, { width: col2Width - 20, align: 'right' });
      } else {
        doc.text(tableData[i][0], 60, currentY + 10);
        doc.text(tableData[i][1], 50 + col1Width + 10, currentY + 10, { width: col2Width - 20, align: 'right' });
      }
      
      currentY += rowHeight;
    }
    doc.font('Helvetica');

    // Nouvelle page pour les détails
    doc.addPage();
    
    // En-tête de page
    doc.fillColor('#003366');
    doc.fontSize(18).text('Détails par Navire', 50, 50);
    doc.moveTo(50, 75).lineTo(550, 75).stroke('#003366');
    
    let yPosition = 100;
    
    // Tableau des navires
    // En-tête du tableau
    const headers = ['Navire', 'N° IMO', 'Période', 'Recettes', 'Dépenses', 'Résultat'];
    const colWidths = [120, 70, 100, 70, 70, 70];
    const startX = 50;
    
    // Dessiner l'en-tête
    doc.fillColor('#FFFFFF');
    let xPos = startX;
    headers.forEach((header, i) => {
      doc.rect(xPos, yPosition, colWidths[i], 25).fillAndStroke('#003366', '#003366');
      doc.fillColor('#FFFFFF');
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(header, xPos + 5, yPosition + 8, { width: colWidths[i] - 10, align: 'center' });
      xPos += colWidths[i];
    });
    
    yPosition += 25;
    doc.font('Helvetica');
    
    // Lignes du tableau
    details.forEach((navire, index) => {
      if (yPosition > 700) {
        doc.addPage();
        // Répéter l'en-tête de page
        doc.fillColor('#003366');
        doc.fontSize(18).text('Détails par Navire (suite)', 50, 50);
        doc.moveTo(50, 75).lineTo(550, 75).stroke('#003366');
        yPosition = 100;
        
        // Répéter l'en-tête du tableau
        xPos = startX;
        headers.forEach((header, i) => {
          doc.rect(xPos, yPosition, colWidths[i], 25).fillAndStroke('#003366', '#003366');
          doc.fillColor('#FFFFFF');
          doc.fontSize(10).font('Helvetica-Bold');
          doc.text(header, xPos + 5, yPosition + 8, { width: colWidths[i] - 10, align: 'center' });
          xPos += colWidths[i];
        });
        yPosition += 25;
        doc.font('Helvetica');
      }
      
      // Couleur de fond alternée
      const fillColor = index % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
      
      // Données du navire
      const rowData = [
        navire.nom,
        navire.numero_imo || 'N/A',
        (() => {
          if (navire.date_arrivee || navire.date_depart) {
            const arrivee = navire.date_arrivee ? new Date(navire.date_arrivee).toLocaleDateString('fr-FR') : 'N/A';
            const depart = navire.date_depart ? new Date(navire.date_depart).toLocaleDateString('fr-FR') : 'N/A';
            return `${arrivee} - ${depart}`;
          }
          return 'N/A';
        })(),
        formatCurrency(navire.total_recettes),
        formatCurrency(navire.total_depenses),
        formatCurrency(navire.resultat_net)
      ];
      
      // Dessiner les cellules
      xPos = startX;
      const rowHeight = 30;
      rowData.forEach((data, i) => {
        doc.fillColor(fillColor);
        doc.rect(xPos, yPosition, colWidths[i], rowHeight).fillAndStroke(fillColor, '#666666');
        
        // Couleur du texte
        if (i === 5) { // Colonne résultat
          doc.fillColor(navire.resultat_net >= 0 ? '#008000' : '#FF0000');
          doc.font('Helvetica-Bold');
        } else {
          doc.fillColor('#000000');
          doc.font('Helvetica');
        }
        
        doc.fontSize(9);
        const align = (i >= 3) ? 'right' : 'left'; // Aligner à droite les montants
        doc.text(data, xPos + 5, yPosition + 10, { width: colWidths[i] - 10, align: align });
        xPos += colWidths[i];
      });
      
      yPosition += rowHeight;
    });
    
    doc.font('Helvetica');

    // Page statistiques
    if (stats) {
      doc.addPage();
      
      // En-tête
      doc.fillColor('#003366');
      doc.fontSize(18).text('Statistiques', 50, 50);
      doc.moveTo(50, 75).lineTo(550, 75).stroke('#003366');
      
      // Tableau des recettes par type
      doc.fillColor('#003366');
      doc.fontSize(14).text('Recettes par Type', 50, 100);
      
      yPosition = 130;
      
      // En-tête du tableau recettes
      const recettesHeaders = ['Type de Prestation', 'Nombre d\'opérations', 'Montant Total'];
      const recettesColWidths = [250, 125, 125];
      xPos = 50;
      
      recettesHeaders.forEach((header, i) => {
        doc.rect(xPos, yPosition, recettesColWidths[i], 25).fillAndStroke('#003366', '#003366');
        doc.fillColor('#FFFFFF');
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(header, xPos + 5, yPosition + 8, { width: recettesColWidths[i] - 10, align: 'center' });
        xPos += recettesColWidths[i];
      });
      
      yPosition += 25;
      
      // Données recettes
      let totalRecettes = 0;
      let totalOperationsRecettes = 0;
      
      stats.recettesParType.forEach((r, index) => {
        const fillColor = index % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
        xPos = 50;
        
        const rowData = [r.nom, r.nombre_operations.toString(), formatCurrency(r.total)];
        rowData.forEach((data, i) => {
          doc.fillColor(fillColor);
          doc.rect(xPos, yPosition, recettesColWidths[i], 25).fillAndStroke(fillColor, '#666666');
          doc.fillColor('#000000');
          doc.font('Helvetica');
          doc.fontSize(9);
          const align = i === 0 ? 'left' : 'center';
          doc.text(data, xPos + 5, yPosition + 8, { width: recettesColWidths[i] - 10, align: align });
          xPos += recettesColWidths[i];
        });
        
        totalRecettes += r.total || 0;
        totalOperationsRecettes += r.nombre_operations || 0;
        yPosition += 25;
      });
      
      // Ligne de total recettes
      xPos = 50;
      const totalRecettesData = ['TOTAL', totalOperationsRecettes.toString(), formatCurrency(totalRecettes)];
      totalRecettesData.forEach((data, i) => {
        doc.fillColor('#E6F2FF');
        doc.rect(xPos, yPosition, recettesColWidths[i], 25).fillAndStroke('#E6F2FF', '#666666');
        doc.fillColor('#000000');
        doc.font('Helvetica-Bold');
        doc.fontSize(10);
        const align = i === 0 ? 'left' : 'center';
        doc.text(data, xPos + 5, yPosition + 8, { width: recettesColWidths[i] - 10, align: align });
        xPos += recettesColWidths[i];
      });
      
      // Espace entre les tableaux
      yPosition += 50;
      
      // Tableau des dépenses par type
      doc.fillColor('#003366');
      doc.fontSize(14).text('Dépenses par Type', 50, yPosition);
      
      yPosition += 30;
      
      // En-tête du tableau dépenses
      xPos = 50;
      recettesHeaders.forEach((header, i) => {
        doc.rect(xPos, yPosition, recettesColWidths[i], 25).fillAndStroke('#003366', '#003366');
        doc.fillColor('#FFFFFF');
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(header.replace('Prestation', 'Dépense'), xPos + 5, yPosition + 8, { width: recettesColWidths[i] - 10, align: 'center' });
        xPos += recettesColWidths[i];
      });
      
      yPosition += 25;
      
      // Données dépenses
      let totalDepenses = 0;
      let totalOperationsDepenses = 0;
      
      stats.depensesParType.forEach((d, index) => {
        const fillColor = index % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
        xPos = 50;
        
        const rowData = [d.nom, d.nombre_operations.toString(), formatCurrency(d.total)];
        rowData.forEach((data, i) => {
          doc.fillColor(fillColor);
          doc.rect(xPos, yPosition, recettesColWidths[i], 25).fillAndStroke(fillColor, '#666666');
          doc.fillColor('#000000');
          doc.font('Helvetica');
          doc.fontSize(9);
          const align = i === 0 ? 'left' : 'center';
          doc.text(data, xPos + 5, yPosition + 8, { width: recettesColWidths[i] - 10, align: align });
          xPos += recettesColWidths[i];
        });
        
        totalDepenses += d.total || 0;
        totalOperationsDepenses += d.nombre_operations || 0;
        yPosition += 25;
      });
      
      // Ligne de total dépenses
      xPos = 50;
      const totalDepensesData = ['TOTAL', totalOperationsDepenses.toString(), formatCurrency(totalDepenses)];
      totalDepensesData.forEach((data, i) => {
        doc.fillColor('#E6F2FF');
        doc.rect(xPos, yPosition, recettesColWidths[i], 25).fillAndStroke('#E6F2FF', '#666666');
        doc.fillColor('#000000');
        doc.font('Helvetica-Bold');
        doc.fontSize(10);
        const align = i === 0 ? 'left' : 'center';
        doc.text(data, xPos + 5, yPosition + 8, { width: recettesColWidths[i] - 10, align: align });
        xPos += recettesColWidths[i];
      });
      
      doc.font('Helvetica');
    }

    // Pied de page sur la dernière page
    doc.fillColor('#666666');
    doc.fontSize(8);
    doc.text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;