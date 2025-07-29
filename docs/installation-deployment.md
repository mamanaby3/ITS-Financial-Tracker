# Guide d'Installation et de Déploiement

## Installation en Développement

### 1. Prérequis système

- Node.js v14.0.0 ou supérieur
- MySQL 5.7 ou supérieur
- Git
- 4GB RAM minimum
- 10GB espace disque disponible

### 2. Installation MySQL

#### Windows
1. Télécharger MySQL Installer depuis https://dev.mysql.com/downloads/installer/
2. Exécuter l'installateur et choisir "Developer Default"
3. Définir le mot de passe root
4. Démarrer MySQL Server

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### 3. Configuration de la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer l'utilisateur de l'application
CREATE USER 'its_user'@'localhost' IDENTIFIED BY 'your_secure_password';

# Créer et configurer la base de données
CREATE DATABASE its_financial_tracker;
GRANT ALL PRIVILEGES ON its_financial_tracker.* TO 'its_user'@'localhost';
FLUSH PRIVILEGES;

# Importer le schéma
USE its_financial_tracker;
SOURCE /chemin/vers/its-financial-tracker/database/schema.sql;
```

### 4. Installation de l'application

```bash
# Cloner le repository
git clone https://github.com/votre-repo/its-financial-tracker.git
cd its-financial-tracker

# Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres

# Frontend
cd ../frontend
npm install
```

## Configuration

### Backend (.env)

```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=its_user
DB_PASSWORD=your_secure_password
DB_NAME=its_financial_tracker

# Serveur
PORT=5000
NODE_ENV=development

# JWT (générer une clé sécurisée)
JWT_SECRET=your_very_long_random_string_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend

Créer un fichier `.env` dans le dossier frontend :

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Déploiement en Production

### 1. Serveur de production

#### Prérequis serveur
- Ubuntu 20.04 LTS ou supérieur
- 2 vCPU minimum
- 4GB RAM
- 20GB SSD
- Node.js et PM2
- Nginx
- MySQL

#### Installation des dépendances

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation PM2
sudo npm install -g pm2

# Installation Nginx
sudo apt install -y nginx

# Installation MySQL
sudo apt install -y mysql-server
```

### 2. Configuration Backend Production

```bash
# Cloner et installer
cd /var/www
sudo git clone https://github.com/votre-repo/its-financial-tracker.git
cd its-financial-tracker/backend
sudo npm install --production

# Configuration environnement
sudo cp .env.example .env
sudo nano .env  # Éditer avec les paramètres de production
```

Fichier `.env` de production :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=its_prod_user
DB_PASSWORD=strong_production_password
DB_NAME=its_financial_tracker_prod

PORT=5000
NODE_ENV=production

JWT_SECRET=very_long_random_production_secret

CORS_ORIGIN=https://your-domain.com
```

### 3. Configuration PM2

Créer `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [{
    name: 'its-backend',
    script: './src/server.js',
    cwd: '/var/www/its-financial-tracker/backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Démarrer avec PM2 :
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Build Frontend Production

```bash
cd /var/www/its-financial-tracker/frontend
npm run build
```

### 5. Configuration Nginx

Créer `/etc/nginx/sites-available/its-tracker` :

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    root /var/www/its-financial-tracker/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Activer le site :
```bash
sudo ln -s /etc/nginx/sites-available/its-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7. Sauvegarde automatique

Créer un script de sauvegarde `/opt/backup-its.sh` :

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/its-tracker"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="its_financial_tracker_prod"
DB_USER="its_prod_user"
DB_PASS="your_password"

# Créer le répertoire si nécessaire
mkdir -p $BACKUP_DIR

# Sauvegarde base de données
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compression
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR db_backup_$DATE.sql

# Suppression du fichier SQL non compressé
rm $BACKUP_DIR/db_backup_$DATE.sql

# Garder seulement les 30 dernières sauvegardes
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

Ajouter au crontab :
```bash
sudo crontab -e
# Ajouter :
0 2 * * * /opt/backup-its.sh
```

### 8. Monitoring

#### Installation de monitoring basique

```bash
# Logs PM2
pm2 logs its-backend

# Status
pm2 status

# Monitoring système
sudo apt install htop
htop
```

## Maintenance

### Mise à jour de l'application

```bash
cd /var/www/its-financial-tracker
sudo git pull origin main

# Backend
cd backend
sudo npm install --production
pm2 restart its-backend

# Frontend
cd ../frontend
npm install
npm run build
```

### Commandes utiles

```bash
# Redémarrer backend
pm2 restart its-backend

# Voir les logs
pm2 logs its-backend --lines 100

# Status MySQL
sudo systemctl status mysql

# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier l'espace disque
df -h

# Mémoire système
free -m
```

## Dépannage

### Backend ne démarre pas
1. Vérifier les logs : `pm2 logs its-backend`
2. Vérifier la connexion MySQL
3. Vérifier les variables d'environnement

### Erreur 502 Bad Gateway
1. Vérifier que le backend est en cours d'exécution
2. Vérifier la configuration Nginx
3. Vérifier les logs Nginx : `sudo tail -f /var/log/nginx/error.log`

### Performance lente
1. Vérifier l'utilisation CPU/RAM
2. Optimiser les requêtes MySQL
3. Augmenter le nombre d'instances PM2

## Sécurité

### Recommandations
1. Utiliser des mots de passe forts
2. Activer le firewall UFW
3. Mettre à jour régulièrement
4. Sauvegarder quotidiennement
5. Monitorer les accès
6. Utiliser HTTPS uniquement en production

### Configuration firewall

```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```