# ITS Financial Tracker

Application de suivi financier pour ITS (International Trading & Services), permettant de gérer les performances économiques mensuelles de l'entreprise.

## Fonctionnalités

- **Gestion des navires** : Enregistrement et suivi des navires exploités
- **Suivi des recettes** : Enregistrement des prestations (manutention, consignation, transit)
- **Suivi des dépenses** : Gestion de 15 types de dépenses par navire
- **Charges de fonctionnement** : Suivi mensuel des charges fixes de l'entreprise
- **Tableaux de bord** : Visualisation graphique des performances
- **Rapports mensuels** : Génération de rapports détaillés avec export Excel/PDF
- **Calcul automatique** : Résultat net par navire et résultat global mensuel

## Installation

### Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)
- npm ou yarn

### Base de données

1. Créer une base de données MySQL :
```bash
mysql -u root -p
```

2. Exécuter le script de création :
```sql
source database/schema.sql
```

### Backend

1. Accéder au dossier backend :
```bash
cd backend
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer le fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

4. Configurer les variables d'environnement dans `.env`

5. Démarrer le serveur :
```bash
npm run dev
```

### Frontend

1. Accéder au dossier frontend :
```bash
cd frontend
```

2. Installer les dépendances :
```bash
npm install
```

3. Démarrer l'application :
```bash
npm start
```

L'application sera accessible à l'adresse : http://localhost:3000

## Utilisation

### 1. Gestion des navires

- Cliquer sur "Navires" dans le menu principal
- Ajouter un nouveau navire avec le bouton "Nouveau Navire"
- Renseigner les informations : nom, numéro IMO, dates d'arrivée/départ
- Cliquer sur l'icône œil pour accéder aux détails d'un navire

### 2. Enregistrement des recettes et dépenses

Dans la page de détail d'un navire :
- Cliquer sur "Ajouter" dans la section Recettes ou Dépenses
- Sélectionner le type de prestation/dépense
- Saisir le montant et la date
- Ajouter une description (optionnel)

### 3. Charges de fonctionnement

- Accéder à "Charges Fonctionnement" dans le menu
- Sélectionner le mois et l'année
- Cliquer sur l'icône crayon pour modifier une charge
- Saisir le montant et la description
- Sauvegarder

### 4. Consultation des rapports

- Accéder à "Rapports Mensuels" dans le menu
- Sélectionner le mois et l'année
- Visualiser le résumé, les détails par navire et les graphiques
- Exporter en Excel ou PDF avec les boutons dédiés

## Structure des données

### Types de prestations
- Manutention
- Consignation  
- Transit

### Types de dépenses
1. Frais de manutention
2. Frais pont bascule (CCIAD)
3. Redevances marchandises (PAD)
4. TS Douane
5. Escorte Douane
6. Frais de consignation
7. Carburant
8. Transport vers entrepôts
9. Achat sacs d'emballage
10. Location de matériel
11. Frais de surveillance navire
12. Frais dockers
13. Main d'œuvre magasins
14. Main d'œuvre port
15. Frais divers

### Charges de fonctionnement
- Location terrains/bâtiments/bureaux
- Assurances
- Carburant véhicules de fonction
- Rémunération des administrateurs
- Eau
- Électricité
- Télécommunications
- Impôts et taxes
- Charges de personnel
- Charges financières

## Calculs

**Résultat par navire** = Total Recettes - Total Dépenses

**Résultat global mensuel** = Σ(Résultats navires) - Total Charges Fonctionnement

## Technologies utilisées

- **Backend** : Node.js, Express.js, MySQL
- **Frontend** : React, Tailwind CSS, Chart.js
- **Export** : ExcelJS, PDFKit

## Support

Pour toute question ou problème, contacter le service informatique d'ITS.