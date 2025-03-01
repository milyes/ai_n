#!/bin/bash

# Script de déploiement automatisé pour NetSecure Pro sur Apache2
# À exécuter en tant que root ou avec sudo sur votre serveur Ubuntu

# Variables de configuration
APP_DIR="/var/www/netsecurepro"
SERVER_IP="172.29.81.208"  # Remplacez par votre IP si différente
FORCE_INSTALL=false

# Fonction pour afficher des messages
print_message() {
    echo -e "\n\033[1;34m==>\033[0m \033[1m$1\033[0m"
}

# Fonction pour afficher des erreurs
print_error() {
    echo -e "\n\033[1;31m==>\033[0m \033[1m$1\033[0m"
}

# Fonction pour afficher des succès
print_success() {
    echo -e "\n\033[1;32m==>\033[0m \033[1m$1\033[0m"
}

# Vérifier si l'utilisateur est root
if [ "$(id -u)" -ne 0 ]; then
    print_error "Ce script doit être exécuté en tant que root ou avec sudo"
    exit 1
fi

# Vérifier si Apache est installé
if ! command -v apache2 &> /dev/null; then
    print_error "Apache2 n'est pas installé. Installation en cours..."
    apt update
    apt install -y apache2
    systemctl enable apache2
    systemctl start apache2
fi

# Installation des dépendances
print_message "Installation des dépendances système..."
apt update
apt install -y python3-pip python3-venv nodejs npm curl sudo

# Activation des modules Apache
print_message "Activation des modules Apache..."
a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests rewrite headers
systemctl restart apache2

# Création du répertoire de l'application
print_message "Création du répertoire de l'application..."
mkdir -p $APP_DIR
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ] && [ "$FORCE_INSTALL" = false ]; then
    print_error "Le répertoire $APP_DIR existe déjà et n'est pas vide."
    read -p "Voulez-vous écraser son contenu ? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Installation annulée."
        exit 1
    fi
    rm -rf $APP_DIR/*
fi

# Extraction de l'archive NetSecure Pro
print_message "Extraction de l'archive NetSecure Pro..."
if [ -f "./NetSecurePro.tar.gz" ]; then
    tar -xzf NetSecurePro.tar.gz -C $APP_DIR
    cd $APP_DIR
else
    print_error "L'archive NetSecurePro.tar.gz n'a pas été trouvée dans le répertoire courant."
    exit 1
fi

# Correction des permissions
print_message "Correction des permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# Installation des dépendances Node.js
print_message "Installation des dépendances Node.js..."
cd $APP_DIR
npm install

# Configuration de l'environnement Python
print_message "Configuration de l'environnement Python..."
cd $APP_DIR/FlaskServer
python3 -m venv venv
chown -R www-data:www-data venv
su -s /bin/bash www-data -c "source venv/bin/activate && pip install flask flask-cors python-dotenv requests"

# Création du fichier requirements.txt s'il n'existe pas
if [ ! -f "requirements.txt" ]; then
    print_message "Création du fichier requirements.txt..."
    su -s /bin/bash www-data -c 'echo "flask==2.3.3
flask-cors==4.0.0
python-dotenv==1.0.0
requests==2.31.0" > requirements.txt'
fi

# Rendre les scripts exécutables
print_message "Configuration des scripts d'exécution..."
chmod +x $APP_DIR/FlaskServer/run_flask.sh
chmod +x $APP_DIR/run_all.sh

# Création des fichiers de service systemd
print_message "Création des services systemd..."

cat > /etc/systemd/system/netsecurepro-express.service << EOF
[Unit]
Description=NetSecure Pro Express Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run dev
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/netsecurepro-flask.service << EOF
[Unit]
Description=NetSecure Pro Flask Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR/FlaskServer
ExecStart=$APP_DIR/FlaskServer/venv/bin/python main.py
Restart=on-failure
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# Configuration d'Apache
print_message "Configuration d'Apache..."

cat > /etc/apache2/sites-available/netsecurepro.conf << EOF
<VirtualHost *:80>
    ServerName $SERVER_IP
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

# Activation du site et redémarrage d'Apache
print_message "Activation du site..."
a2dissite 000-default.conf > /dev/null 2>&1
a2ensite netsecurepro.conf
systemctl reload apache2

# Configuration de OpenAI API (optionnel)
print_message "Configuration de la clé API OpenAI..."
read -p "Avez-vous une clé API OpenAI à configurer ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Entrez votre clé API OpenAI: " openai_key
    echo "OPENAI_API_KEY=$openai_key" > $APP_DIR/FlaskServer/.env
    chown www-data:www-data $APP_DIR/FlaskServer/.env
    chmod 600 $APP_DIR/FlaskServer/.env
fi

# Démarrage des services
print_message "Démarrage des services..."
systemctl daemon-reload
systemctl enable netsecurepro-express
systemctl enable netsecurepro-flask
systemctl restart netsecurepro-express
systemctl restart netsecurepro-flask

# Vérification des services
print_message "Vérification de l'état des services..."
systemctl status netsecurepro-express --no-pager
systemctl status netsecurepro-flask --no-pager

print_success "Installation terminée ! NetSecure Pro est maintenant accessible à l'adresse http://$SERVER_IP/"
print_message "En cas de problème, vérifiez les journaux:"
echo "  - Apache: tail -f /var/log/apache2/netsecurepro-error.log"
echo "  - Express: journalctl -fu netsecurepro-express"
echo "  - Flask: journalctl -fu netsecurepro-flask"
echo ""
echo "Pour redémarrer les services:"
echo "  sudo systemctl restart netsecurepro-express netsecurepro-flask"
echo ""