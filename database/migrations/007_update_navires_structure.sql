-- Modifier la structure de la table navires pour avoir client_id et produit_id
-- et supprimer numero_imo

-- Ajouter les colonnes client_id et produit_id
ALTER TABLE navires 
ADD COLUMN client_id INT AFTER tonnage_total,
ADD COLUMN produit_id INT AFTER client_id;

-- Ajouter les clés étrangères
ALTER TABLE navires
ADD CONSTRAINT fk_navires_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_navires_produit FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL;

-- Optionnel : Supprimer la colonne numero_imo si vous ne voulez plus l'utiliser
-- ALTER TABLE navires DROP COLUMN numero_imo;