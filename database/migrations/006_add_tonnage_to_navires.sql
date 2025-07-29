-- Ajouter seulement la colonne tonnage_total à la table navires
-- Les clients et produits sont gérés via la table navire_clients

-- Vérifier si la colonne existe déjà et l'ajouter si elle n'existe pas
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'navires' 
               AND COLUMN_NAME = 'tonnage_total');

SET @sqlstmt := IF(@exist = 0, 
                   'ALTER TABLE navires ADD COLUMN tonnage_total DECIMAL(10,2) DEFAULT 0 AFTER numero_imo',
                   'SELECT "Column tonnage_total already exists" AS message');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;