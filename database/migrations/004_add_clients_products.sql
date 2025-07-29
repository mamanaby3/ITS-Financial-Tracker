-- Ajout de la table clients
CREATE TABLE IF NOT EXISTS clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(200) NOT NULL,
  code_client VARCHAR(50) UNIQUE,
  email VARCHAR(100),
  telephone VARCHAR(50),
  adresse TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ajout de la table produits
CREATE TABLE IF NOT EXISTS produits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(200) NOT NULL,
  code_produit VARCHAR(50) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table de liaison navire-clients (plusieurs clients par navire)
CREATE TABLE IF NOT EXISTS navire_clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  navire_id INT NOT NULL,
  client_id INT NOT NULL,
  produit_id INT,
  tonnage DECIMAL(10,2),
  date_chargement DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (navire_id) REFERENCES navires(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL
);

-- Ajouter le tonnage total au navire
ALTER TABLE navires 
ADD COLUMN tonnage_total DECIMAL(10,2) DEFAULT 0 AFTER numero_imo;

-- Créer des index pour les performances
CREATE INDEX idx_navire_clients_navire ON navire_clients(navire_id);
CREATE INDEX idx_navire_clients_client ON navire_clients(client_id);
CREATE INDEX idx_navire_clients_produit ON navire_clients(produit_id);

-- Insérer quelques données de test
INSERT INTO clients (nom, code_client, email, telephone) VALUES
('SONATRACH', 'CL001', 'contact@sonatrach.dz', '+213 21 63 00 00'),
('TOTAL ENERGIES', 'CL002', 'contact@totalenergies.com', '+33 1 47 44 45 46'),
('SHELL', 'CL003', 'contact@shell.com', '+44 20 7934 1234'),
('BP', 'CL004', 'contact@bp.com', '+44 20 7496 4000');

INSERT INTO produits (nom, code_produit, description) VALUES
('Pétrole brut', 'PR001', 'Pétrole brut léger'),
('Gasoil', 'PR002', 'Diesel marine'),
('Essence', 'PR003', 'Essence sans plomb'),
('Kérosène', 'PR004', 'Carburant aviation'),
('Fuel lourd', 'PR005', 'Fuel oil lourd');