# Guide Utilisateur - ITS Financial Tracker

## Table des matières

1. [Introduction](#introduction)
2. [Connexion à l'application](#connexion-à-lapplication)
3. [Tableau de bord](#tableau-de-bord)
4. [Gestion des navires](#gestion-des-navires)
5. [Gestion des recettes et dépenses](#gestion-des-recettes-et-dépenses)
6. [Charges de fonctionnement](#charges-de-fonctionnement)
7. [Rapports mensuels](#rapports-mensuels)
8. [Export des données](#export-des-données)
9. [FAQ](#faq)

## Introduction

ITS Financial Tracker est une application web conçue pour suivre les performances financières mensuelles d'ITS. Elle permet de gérer les navires, enregistrer les recettes et dépenses, suivre les charges de fonctionnement et générer des rapports détaillés.

## Connexion à l'application

1. Ouvrir votre navigateur web (Chrome, Firefox, Safari)
2. Accéder à l'adresse : http://localhost:3000
3. L'application s'ouvre sur le tableau de bord

## Tableau de bord

Le tableau de bord présente une vue d'ensemble de l'activité du mois en cours :

- **Nombre de navires** : Total des navires traités dans le mois
- **Total Recettes** : Somme de toutes les prestations facturées
- **Total Dépenses** : Somme de toutes les dépenses engagées
- **Résultat Net Navires** : Différence entre recettes et dépenses
- **Charges Fonctionnement** : Total des charges fixes du mois
- **Résultat Global** : Résultat net après déduction des charges

### Graphiques

- **Répartition des Recettes** : Diagramme circulaire des recettes par type
- **Évolution Annuelle** : Graphique linéaire de l'évolution mensuelle

## Gestion des navires

### Ajouter un navire

1. Cliquer sur "Navires" dans le menu principal
2. Cliquer sur le bouton "Nouveau Navire"
3. Remplir le formulaire :
   - **Nom du navire** (obligatoire)
   - **Numéro IMO** (optionnel)
   - **Date d'arrivée** (obligatoire)
   - **Date de départ** (optionnel)
   - **Statut** : En cours ou Terminé
4. Cliquer sur "Enregistrer"

### Modifier un navire

1. Dans la liste des navires, cliquer sur l'icône crayon
2. Modifier les informations souhaitées
3. Cliquer sur "Enregistrer"

### Supprimer un navire

1. Cliquer sur l'icône poubelle
2. Confirmer la suppression
3. **Attention** : Cette action supprime également toutes les recettes et dépenses associées

## Gestion des recettes et dépenses

### Accéder aux détails d'un navire

1. Dans la liste des navires, cliquer sur l'icône œil
2. La page affiche :
   - Les informations du navire
   - Le résumé financier
   - Les listes des recettes et dépenses

### Ajouter une recette

1. Dans la section "Recettes", cliquer sur "Ajouter"
2. Remplir le formulaire :
   - **Type de prestation** : Sélectionner dans la liste
   - **Montant** : Saisir en FCFA
   - **Date** : Date de la recette
   - **Description** : Détails supplémentaires (optionnel)
3. Cliquer sur "Enregistrer"

### Ajouter une dépense

1. Dans la section "Dépenses", cliquer sur "Ajouter"
2. Remplir le formulaire :
   - **Type de dépense** : Sélectionner parmi les 15 types
   - **Montant** : Saisir en FCFA
   - **Date** : Date de la dépense
   - **Description** : Détails supplémentaires (optionnel)
3. Cliquer sur "Enregistrer"

### Modifier/Supprimer une entrée

- **Modifier** : Cliquer sur "Modifier" à côté de l'entrée
- **Supprimer** : Cliquer sur "Supprimer" et confirmer

## Charges de fonctionnement

Les charges de fonctionnement sont les frais fixes mensuels de l'entreprise.

### Saisir les charges

1. Accéder à "Charges Fonctionnement" dans le menu
2. Sélectionner le mois et l'année
3. Pour chaque type de charge :
   - Cliquer sur l'icône crayon
   - Saisir le montant
   - Ajouter une description si nécessaire
   - Cliquer sur "Sauvegarder"

### Types de charges disponibles

- Location terrains/bâtiments/bureaux
- Assurances
- Carburant véhicules
- Rémunération administrateurs
- Eau
- Électricité
- Télécommunications
- Impôts et taxes
- Charges de personnel
- Charges financières

## Rapports mensuels

### Consulter un rapport

1. Accéder à "Rapports Mensuels" dans le menu
2. Sélectionner le mois et l'année
3. Le rapport affiche :
   - Résumé global avec indicateurs clés
   - Tableau détaillé par navire
   - Graphiques de répartition
   - Calcul du résultat global

### Éléments du rapport

- **Résumé global** : Vue d'ensemble des performances
- **Détails par navire** : Liste avec recettes, dépenses et résultat
- **Graphiques** :
  - Répartition des recettes par type
  - Top 5 des dépenses
- **Résultat final** : Après déduction des charges de fonctionnement

## Export des données

### Export Excel

1. Dans la page des rapports, cliquer sur "Excel"
2. Le fichier contient :
   - Feuille "Résumé" : Synthèse globale
   - Feuille "Détails Navires" : Liste complète
   - Feuille "Statistiques" : Répartitions détaillées

### Export PDF

1. Cliquer sur "PDF"
2. Le document contient :
   - Page de garde avec résumé
   - Liste détaillée des navires
   - Graphiques et statistiques

## FAQ

### Comment annuler une saisie ?

Vous pouvez modifier ou supprimer toute entrée en accédant aux détails du navire concerné.

### Les calculs sont-ils automatiques ?

Oui, tous les totaux et résultats sont calculés automatiquement.

### Puis-je consulter les données des mois précédents ?

Oui, utilisez les sélecteurs de mois/année disponibles sur chaque page.

### Comment sauvegarder les données ?

Les données sont automatiquement sauvegardées dans la base de données à chaque action.

### Que faire en cas d'erreur ?

1. Rafraîchir la page
2. Vérifier votre connexion internet
3. Contacter le support technique si le problème persiste

## Support

Pour toute assistance supplémentaire, contacter :
- Email : support@its.com
- Téléphone : +XXX XX XX XX XX