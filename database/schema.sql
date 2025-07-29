-- Base de données pour le suivi financier ITS
CREATE DATABASE IF NOT EXISTS its_financial_tracker;
USE its_financial_tracker;

-- Table des navires
CREATE TABLE navires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    numero_imo VARCHAR(20),
    date_arrivee DATE NOT NULL,
    date_depart DATE,
    statut ENUM('en_cours', 'termine') DEFAULT 'en_cours',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des types de prestations
CREATE TABLE types_prestations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    categorie ENUM('manutention', 'consignation', 'transit') NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table des recettes par navire
CREATE TABLE recettes_navires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    navire_id INT NOT NULL,
    type_prestation_id INT NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    date_recette DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (navire_id) REFERENCES navires(id) ON DELETE CASCADE,
    FOREIGN KEY (type_prestation_id) REFERENCES types_prestations(id)
);

-- Table des types de dépenses
CREATE TABLE types_depenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table des dépenses par navire
CREATE TABLE depenses_navires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    navire_id INT NOT NULL,
    type_depense_id INT NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    date_depense DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (navire_id) REFERENCES navires(id) ON DELETE CASCADE,
    FOREIGN KEY (type_depense_id) REFERENCES types_depenses(id)
);

-- Table des types de charges de fonctionnement
CREATE TABLE types_charges_fonctionnement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table des charges de fonctionnement mensuelles
CREATE TABLE charges_fonctionnement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_charge_id INT NOT NULL,
    montant DECIMAL(15, 2) NOT NULL,
    mois INT NOT NULL CHECK (mois >= 1 AND mois <= 12),
    annee INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_charge_id) REFERENCES types_charges_fonctionnement(id),
    UNIQUE KEY unique_charge_mois (type_charge_id, mois, annee)
);

-- Vue pour le résultat par navire
CREATE VIEW vue_resultats_navires AS
SELECT 
    n.id,
    n.nom,
    n.numero_imo,
    n.date_arrivee,
    n.date_depart,
    COALESCE(r.total_recettes, 0) as total_recettes,
    COALESCE(d.total_depenses, 0) as total_depenses,
    (COALESCE(r.total_recettes, 0) - COALESCE(d.total_depenses, 0)) as resultat_net
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
) d ON n.id = d.navire_id;

-- Vue pour le résultat mensuel global
CREATE VIEW vue_resultats_mensuels AS
SELECT 
    YEAR(n.date_arrivee) as annee,
    MONTH(n.date_arrivee) as mois,
    COUNT(DISTINCT n.id) as nombre_navires,
    SUM(COALESCE(r.total_recettes, 0)) as total_recettes,
    SUM(COALESCE(d.total_depenses, 0)) as total_depenses,
    SUM(COALESCE(r.total_recettes, 0) - COALESCE(d.total_depenses, 0)) as resultat_net_navires,
    COALESCE(cf.total_charges, 0) as total_charges_fonctionnement,
    (SUM(COALESCE(r.total_recettes, 0) - COALESCE(d.total_depenses, 0)) - COALESCE(cf.total_charges, 0)) as resultat_global
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
    SELECT mois, annee, SUM(montant) as total_charges
    FROM charges_fonctionnement
    GROUP BY mois, annee
) cf ON MONTH(n.date_arrivee) = cf.mois AND YEAR(n.date_arrivee) = cf.annee
GROUP BY YEAR(n.date_arrivee), MONTH(n.date_arrivee), cf.total_charges;

-- Insertion des types de prestations
INSERT INTO types_prestations (categorie, nom) VALUES
('manutention', 'Prestations de manutention'),
('consignation', 'Prestations de consignation'),
('transit', 'Prestations de transit');

-- Insertion des types de dépenses
INSERT INTO types_depenses (code, nom) VALUES
('FRAIS_MANUTENTION', 'Frais de manutention'),
('PONT_BASCULE', 'Frais pont bascule (CCIAD)'),
('REDEVANCES_MARCHANDISES', 'Redevances marchandises (PAD)'),
('TS_DOUANE', 'TS Douane'),
('ESCORTE_DOUANE', 'Escorte Douane'),
('FRAIS_CONSIGNATION', 'Frais de consignation'),
('CARBURANT', 'Carburant'),
('TRANSPORT_ENTREPOTS', 'Transport vers entrepôts'),
('SACS_EMBALLAGE', 'Achat sacs d\'emballage'),
('LOCATION_MATERIEL', 'Location de matériel'),
('SURVEILLANCE_NAVIRE', 'Frais de surveillance navire'),
('FRAIS_DOCKERS', 'Frais dockers'),
('MO_MAGASINS', 'Main d\'œuvre magasins'),
('MO_PORT', 'Main d\'œuvre port'),
('FRAIS_DIVERS', 'Frais divers');

-- Insertion des types de charges de fonctionnement
INSERT INTO types_charges_fonctionnement (code, nom) VALUES
('LOCATION', 'Location terrains / bâtiments / bureaux'),
('ASSURANCES', 'Assurances'),
('CARBURANT_VEHICULES', 'Carburant véhicules de fonction'),
('REMUNERATION_ADMIN', 'Rémunération des administrateurs'),
('EAU', 'Eau'),
('ELECTRICITE', 'Electricité'),
('TELECOM', 'Télécommunications'),
('IMPOTS_TAXES', 'Impôts et taxes'),
('CHARGES_PERSONNEL', 'Charges de personnel'),
('CHARGES_FINANCIERES', 'Charges financières');