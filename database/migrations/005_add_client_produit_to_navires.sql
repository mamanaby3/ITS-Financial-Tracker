-- Ajouter les colonnes client et produit directement dans la table navires
ALTER TABLE navires 
ADD COLUMN client_nom VARCHAR(200) AFTER numero_imo,
ADD COLUMN produit_nom VARCHAR(200) AFTER client_nom,
ADD COLUMN quantite DECIMAL(10,2) DEFAULT 0 AFTER produit_nom;