export const rapportAnnuelMock = {
  success: true,
  data: {
    totalAnnuel: {
      nombre_navires_total: 45,
      total_recettes_annuel: 2850000000,
      total_depenses_annuel: 1920000000,
      resultat_net_navires_annuel: 930000000,
      charges_fonctionnement_annuel: 180000000,
      resultat_global_annuel: 750000000
    },
    evolutionMensuelle: [
      {
        mois: 1,
        nom_mois: 'Janvier',
        nombre_navires: 3,
        total_recettes: 215000000,
        total_depenses: 145000000,
        resultat_net_navires: 70000000,
        charges_fonctionnement: 15000000,
        resultat_global: 55000000
      },
      {
        mois: 2,
        nom_mois: 'Février',
        nombre_navires: 4,
        total_recettes: 280000000,
        total_depenses: 190000000,
        resultat_net_navires: 90000000,
        charges_fonctionnement: 15000000,
        resultat_global: 75000000
      },
      {
        mois: 3,
        nom_mois: 'Mars',
        nombre_navires: 5,
        total_recettes: 320000000,
        total_depenses: 210000000,
        resultat_net_navires: 110000000,
        charges_fonctionnement: 15000000,
        resultat_global: 95000000
      },
      {
        mois: 4,
        nom_mois: 'Avril',
        nombre_navires: 4,
        total_recettes: 290000000,
        total_depenses: 195000000,
        resultat_net_navires: 95000000,
        charges_fonctionnement: 15000000,
        resultat_global: 80000000
      },
      {
        mois: 5,
        nom_mois: 'Mai',
        nombre_navires: 3,
        total_recettes: 225000000,
        total_depenses: 150000000,
        resultat_net_navires: 75000000,
        charges_fonctionnement: 15000000,
        resultat_global: 60000000
      },
      {
        mois: 6,
        nom_mois: 'Juin',
        nombre_navires: 4,
        total_recettes: 270000000,
        total_depenses: 180000000,
        resultat_net_navires: 90000000,
        charges_fonctionnement: 15000000,
        resultat_global: 75000000
      },
      {
        mois: 7,
        nom_mois: 'Juillet',
        nombre_navires: 5,
        total_recettes: 310000000,
        total_depenses: 205000000,
        resultat_net_navires: 105000000,
        charges_fonctionnement: 15000000,
        resultat_global: 90000000
      },
      {
        mois: 8,
        nom_mois: 'Août',
        nombre_navires: 4,
        total_recettes: 265000000,
        total_depenses: 175000000,
        resultat_net_navires: 90000000,
        charges_fonctionnement: 15000000,
        resultat_global: 75000000
      },
      {
        mois: 9,
        nom_mois: 'Septembre',
        nombre_navires: 3,
        total_recettes: 195000000,
        total_depenses: 130000000,
        resultat_net_navires: 65000000,
        charges_fonctionnement: 15000000,
        resultat_global: 50000000
      },
      {
        mois: 10,
        nom_mois: 'Octobre',
        nombre_navires: 4,
        total_recettes: 245000000,
        total_depenses: 160000000,
        resultat_net_navires: 85000000,
        charges_fonctionnement: 15000000,
        resultat_global: 70000000
      },
      {
        mois: 11,
        nom_mois: 'Novembre',
        nombre_navires: 3,
        total_recettes: 190000000,
        total_depenses: 125000000,
        resultat_net_navires: 65000000,
        charges_fonctionnement: 15000000,
        resultat_global: 50000000
      },
      {
        mois: 12,
        nom_mois: 'Décembre',
        nombre_navires: 4,
        total_recettes: 245000000,
        total_depenses: 155000000,
        resultat_net_navires: 90000000,
        charges_fonctionnement: 15000000,
        resultat_global: 75000000
      }
    ],
    topNavires: [
      {
        id: 1,
        nom: 'MV ATLANTIC STAR',
        numero_imo: 'IMO9876543',
        total_recettes: 450000000,
        total_depenses: 280000000,
        resultat_net: 170000000
      },
      {
        id: 2,
        nom: 'MV PACIFIC DREAM',
        numero_imo: 'IMO9876544',
        total_recettes: 420000000,
        total_depenses: 270000000,
        resultat_net: 150000000
      },
      {
        id: 3,
        nom: 'MV AFRICA HOPE',
        numero_imo: 'IMO9876545',
        total_recettes: 380000000,
        total_depenses: 240000000,
        resultat_net: 140000000
      },
      {
        id: 4,
        nom: 'MV INDIAN OCEAN',
        numero_imo: 'IMO9876546',
        total_recettes: 350000000,
        total_depenses: 220000000,
        resultat_net: 130000000
      },
      {
        id: 5,
        nom: 'MV ARCTIC WIND',
        numero_imo: 'IMO9876547',
        total_recettes: 320000000,
        total_depenses: 200000000,
        resultat_net: 120000000
      },
      {
        id: 6,
        nom: 'MV CARIBBEAN SEA',
        numero_imo: 'IMO9876548',
        total_recettes: 300000000,
        total_depenses: 195000000,
        resultat_net: 105000000
      },
      {
        id: 7,
        nom: 'MV MEDITERRANEAN',
        numero_imo: 'IMO9876549',
        total_recettes: 280000000,
        total_depenses: 185000000,
        resultat_net: 95000000
      },
      {
        id: 8,
        nom: 'MV BLACK SEA',
        numero_imo: 'IMO9876550',
        total_recettes: 250000000,
        total_depenses: 170000000,
        resultat_net: 80000000
      }
    ],
    topClients: [
      {
        id: 1,
        client: 'COTCO SHIPPING',
        type: 'Armateur',
        nombre_navires: 12,
        tonnage_total: 450000,
        produits: 'Conteneurs, Vrac'
      },
      {
        id: 2,
        client: 'MAERSK LINE',
        type: 'Armateur',
        nombre_navires: 8,
        tonnage_total: 380000,
        produits: 'Conteneurs'
      },
      {
        id: 3,
        client: 'CMA CGM',
        type: 'Armateur',
        nombre_navires: 7,
        tonnage_total: 320000,
        produits: 'Conteneurs, Réfrigéré'
      },
      {
        id: 4,
        client: 'HAPAG-LLOYD',
        type: 'Armateur',
        nombre_navires: 6,
        tonnage_total: 280000,
        produits: 'Conteneurs'
      },
      {
        id: 5,
        client: 'EVERGREEN',
        type: 'Armateur',
        nombre_navires: 5,
        tonnage_total: 250000,
        produits: 'Conteneurs'
      },
      {
        id: 6,
        client: 'NYK LINE',
        type: 'Armateur',
        nombre_navires: 4,
        tonnage_total: 180000,
        produits: 'Vrac, Véhicules'
      },
      {
        id: 7,
        client: 'COSCO BULK',
        type: 'Opérateur',
        nombre_navires: 3,
        tonnage_total: 150000,
        produits: 'Vrac sec'
      },
      {
        id: 8,
        client: 'MOL',
        type: 'Armateur',
        nombre_navires: 3,
        tonnage_total: 140000,
        produits: 'Conteneurs, GNL'
      },
      {
        id: 9,
        client: 'K LINE',
        type: 'Armateur',
        nombre_navires: 2,
        tonnage_total: 95000,
        produits: 'Véhicules'
      },
      {
        id: 10,
        client: 'YANG MING',
        type: 'Armateur',
        nombre_navires: 2,
        tonnage_total: 85000,
        produits: 'Conteneurs'
      }
    ],
    topProduits: [
      {
        id: 1,
        produit: 'Conteneurs 20\'',
        categorie: 'Conteneurs',
        nombre_navires: 25,
        nombre_clients: 8,
        tonnage_total: 850000
      },
      {
        id: 2,
        produit: 'Conteneurs 40\'',
        categorie: 'Conteneurs',
        nombre_navires: 22,
        nombre_clients: 7,
        tonnage_total: 780000
      },
      {
        id: 3,
        produit: 'Minerai de fer',
        categorie: 'Vrac sec',
        nombre_navires: 8,
        nombre_clients: 3,
        tonnage_total: 450000
      },
      {
        id: 4,
        produit: 'Charbon',
        categorie: 'Vrac sec',
        nombre_navires: 6,
        nombre_clients: 2,
        tonnage_total: 320000
      },
      {
        id: 5,
        produit: 'Céréales',
        categorie: 'Vrac sec',
        nombre_navires: 5,
        nombre_clients: 3,
        tonnage_total: 280000
      },
      {
        id: 6,
        produit: 'Pétrole brut',
        categorie: 'Vrac liquide',
        nombre_navires: 4,
        nombre_clients: 2,
        tonnage_total: 250000
      },
      {
        id: 7,
        produit: 'Produits pétroliers',
        categorie: 'Vrac liquide',
        nombre_navires: 3,
        nombre_clients: 2,
        tonnage_total: 180000
      },
      {
        id: 8,
        produit: 'Véhicules neufs',
        categorie: 'Roulier',
        nombre_navires: 3,
        nombre_clients: 2,
        tonnage_total: 120000
      },
      {
        id: 9,
        produit: 'Produits chimiques',
        categorie: 'Vrac liquide',
        nombre_navires: 2,
        nombre_clients: 2,
        tonnage_total: 95000
      },
      {
        id: 10,
        produit: 'GNL',
        categorie: 'Gaz',
        nombre_navires: 2,
        nombre_clients: 1,
        tonnage_total: 85000
      }
    ],
    statistiques: {
      recettesParType: [
        { nom: 'Frais de port', total: 850000000 },
        { nom: 'Manutention', total: 650000000 },
        { nom: 'Stockage', total: 450000000 },
        { nom: 'Remorquage', total: 380000000 },
        { nom: 'Pilotage', total: 320000000 },
        { nom: 'Lamanage', total: 150000000 },
        { nom: 'Autres services', total: 50000000 }
      ],
      depensesParType: [
        { nom: 'Carburant', total: 680000000 },
        { nom: 'Main d\'œuvre', total: 450000000 },
        { nom: 'Maintenance', total: 320000000 },
        { nom: 'Assurances', total: 180000000 },
        { nom: 'Équipements', total: 150000000 },
        { nom: 'Fournitures', total: 80000000 },
        { nom: 'Autres', total: 60000000 }
      ],
      chargesParType: [
        { nom: 'Salaires', total: 95000000 },
        { nom: 'Loyers', total: 28000000 },
        { nom: 'Électricité', total: 18000000 },
        { nom: 'Télécommunications', total: 12000000 },
        { nom: 'Fournitures bureau', total: 8000000 },
        { nom: 'Véhicules', total: 7000000 },
        { nom: 'Formation', total: 5000000 },
        { nom: 'Autres', total: 7000000 }
      ]
    }
  }
};