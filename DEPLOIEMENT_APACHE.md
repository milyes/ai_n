# Guide de déploiement de NetSecure Pro sur Apache 2

Ce guide vous aidera à déployer NetSecure Pro sur votre serveur Ubuntu LTS avec Apache 2 à l'adresse 172.29.81.208.

## Méthode 1 : Déploiement automatisé

Un script de déploiement automatisé est fourni pour simplifier le processus d'installation.

### Étape 1 : Transférer les fichiers requis sur le serveur

Transférez les fichiers suivants sur votre serveur :
- `NetSecurePro.tar.gz` (l'archive du projet)
- `deploy_apache.sh` (le script de déploiement)

Vous pouvez utiliser `scp` ou tout autre outil de transfert de fichiers :

```bash
scp NetSecurePro.tar.gz deploy_apache.sh utilisateur@172.29.81.208:~
```

### Étape 2 : Exécuter le script de déploiement

Connectez-vous à votre serveur et exécutez le script de déploiement :

```bash
ssh utilisateur@172.29.81.208
cd ~
chmod +x deploy_apache.sh
sudo ./deploy_apache.sh
```

Le script vous guidera tout au long du processus et vous demandera les informations nécessaires.

### Étape 3 : Vérifier l'installation

Une fois le script terminé, vous devriez pouvoir accéder à NetSecure Pro à l'adresse :
- http://172.29.81.208/

## Méthode 2 : Déploiement manuel

Si vous préférez une installation manuelle, suivez ces étapes.

### Étape 1 : Préparer le serveur

```bash
# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y

# Installer les dépendances nécessaires
sudo apt install -y python3-pip python3-venv nodejs npm

# Activer les modules Apache nécessaires
sudo a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests rewrite headers
sudo systemctl restart apache2
```

### Étape 2 : Déployer l'application

```bash
# Créer un répertoire pour l'application
sudo mkdir -p /var/www/netsecurepro
sudo chown www-data:www-data /var/www/netsecurepro

# Extraire l'archive
sudo tar -xzf NetSecurePro.tar.gz -C /var/www/netsecurepro
sudo chown -R www-data:www-data /var/www/netsecurepro
```

### Étape 3 : Configurer l'environnement

```bash
# Installer les dépendances Node.js
cd /var/www/netsecurepro
sudo npm install

# Configurer l'environnement Python
cd /var/www/netsecurepro/FlaskServer
sudo python3 -m venv venv
sudo chown -R www-data:www-data venv
sudo -u www-data bash -c "source venv/bin/activate && pip install flask flask-cors python-dotenv requests"

# Rendre les scripts exécutables
sudo chmod +x run_flask.sh
sudo chmod +x ../run_all.sh
```

### Étape 4 : Configurer les services systemd

**Créer le service Express :**

```bash
sudo tee /etc/systemd/system/netsecurepro-express.service > /dev/null <<EOF
[Unit]
Description=NetSecure Pro Express Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/netsecurepro
ExecStart=/usr/bin/npm run dev
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
```

**Créer le service Flask :**

```bash
sudo tee /etc/systemd/system/netsecurepro-flask.service > /dev/null <<EOF
[Unit]
Description=NetSecure Pro Flask Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/netsecurepro/FlaskServer
ExecStart=/var/www/netsecurepro/FlaskServer/venv/bin/python main.py
Restart=on-failure
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF
```

### Étape 5 : Configurer Apache

```bash
sudo tee /etc/apache2/sites-available/netsecurepro.conf > /dev/null <<EOF
<VirtualHost *:80>
    ServerName 172.29.81.208
    ServerAdmin webmaster@localhost
    
    # En-têtes de sécurité de base
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Frame-Options "SAMEORIGIN"
    
    # Redirection vers l'interface principale (Flask)
    ProxyPreserveHost On
    ProxyPass / http://localhost:5001/
    ProxyPassReverse / http://localhost:5001/
    
    # Configuration pour l'API Express
    <Location /api>
        ProxyPass http://localhost:5000/api
        ProxyPassReverse http://localhost:5000/api
    </Location>
    
    # Optimisation du cache pour les ressources statiques
    <Location /static>
        ExpiresActive On
        ExpiresDefault "access plus 1 week"
        Header append Cache-Control "public"
    </Location>
    
    ErrorLog \${APACHE_LOG_DIR}/netsecurepro-error.log
    CustomLog \${APACHE_LOG_DIR}/netsecurepro-access.log combined
</VirtualHost>
EOF

# Activer le site
sudo a2dissite 000-default.conf
sudo a2ensite netsecurepro.conf
sudo systemctl reload apache2
```

### Étape 6 : Configurer la clé API OpenAI (optionnel)

```bash
# Créer le fichier .env
sudo -u www-data bash -c 'echo "OPENAI_API_KEY=votre-clé-api" > /var/www/netsecurepro/FlaskServer/.env'
sudo chmod 600 /var/www/netsecurepro/FlaskServer/.env
```

### Étape 7 : Démarrer les services

```bash
sudo systemctl daemon-reload
sudo systemctl enable netsecurepro-express
sudo systemctl enable netsecurepro-flask
sudo systemctl start netsecurepro-express
sudo systemctl start netsecurepro-flask
```

## Dépannage

### Problèmes courants et solutions

#### Problème : Services qui ne démarrent pas

```bash
# Vérifier les logs des services
sudo journalctl -fu netsecurepro-express
sudo journalctl -fu netsecurepro-flask
```

#### Problème : Erreurs Apache

```bash
# Vérifier la configuration Apache
sudo apache2ctl configtest

# Vérifier les logs d'erreur
sudo tail -f /var/log/apache2/netsecurepro-error.log
```

#### Problème : Permissions incorrectes

```bash
sudo chown -R www-data:www-data /var/www/netsecurepro
sudo chmod -R 755 /var/www/netsecurepro
```

## Maintenance

### Redémarrage des services

```bash
sudo systemctl restart netsecurepro-express netsecurepro-flask
sudo systemctl restart apache2
```

### Mise à jour de l'application

```bash
# Arrêter les services
sudo systemctl stop netsecurepro-express netsecurepro-flask

# Sauvegarder l'ancienne version
sudo tar -czf /var/backups/netsecurepro-backup.tar.gz /var/www/netsecurepro

# Déployer la nouvelle version
sudo tar -xzf nouvelle-version.tar.gz -C /var/www/netsecurepro
sudo chown -R www-data:www-data /var/www/netsecurepro

# Redémarrer les services
sudo systemctl start netsecurepro-express netsecurepro-flask
```

## Sécurité

Pour améliorer la sécurité de votre déploiement, considérez ces étapes supplémentaires :

### Configuration HTTPS (recommandé)

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d votre-domaine.com
```

### Pare-feu

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```