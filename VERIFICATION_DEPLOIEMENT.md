# Guide de vérification du déploiement NetSecure Pro

Ce guide vous aide à vérifier que votre déploiement NetSecure Pro sur Apache 2 fonctionne correctement.

## Vérification du statut des services

### 1. Vérifier Apache

```bash
sudo systemctl status apache2
```

L'état devrait être "active (running)". Si ce n'est pas le cas, essayez de redémarrer:

```bash
sudo systemctl restart apache2
```

### 2. Vérifier le service Express

```bash
sudo systemctl status netsecurepro-express
```

Si le service n'est pas actif, vérifiez les journaux:

```bash
sudo journalctl -fu netsecurepro-express
```

### 3. Vérifier le service Flask

```bash
sudo systemctl status netsecurepro-flask
```

Si le service n'est pas actif, vérifiez les journaux:

```bash
sudo journalctl -fu netsecurepro-flask
```

## Vérification des ports

Vérifiez que les applications écoutent sur les bons ports:

```bash
sudo netstat -tuln | grep -E '5000|5001|80'
```

Vous devriez voir:
- Express sur le port 5000
- Flask sur le port 5001
- Apache sur le port 80

## Tests des points d'accès

### 1. Test de l'interface utilisateur

Ouvrez dans votre navigateur:
```
http://172.29.81.208/
```

Vous devriez voir la page d'accueil NetSecure Pro.

### 2. Test du tableau de bord

```
http://172.29.81.208/dashboard
```

### 3. Test de la page des appareils

```
http://172.29.81.208/devices
```

### 4. Test de l'API (via cURL)

```bash
# Test de l'état de l'API
curl -X GET http://172.29.81.208/api/ai/config/origin

# Test d'analyse de sentiment
curl -X POST http://172.29.81.208/api/ai/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "Le réseau fonctionne très bien aujourd'hui."}'
```

## Résolution des problèmes courants

### Problème d'accès - Page Not Found

Si vous obtenez une erreur 404:

1. Vérifiez la configuration du VirtualHost Apache:
```bash
sudo cat /etc/apache2/sites-enabled/netsecurepro.conf
```

2. Assurez-vous que les modules Apache sont activés:
```bash
sudo a2enmod proxy proxy_http headers
sudo systemctl restart apache2
```

### Problème d'API - Connexion refusée

Si vous ne pouvez pas accéder à l'API Express:

1. Vérifiez que le service Express est en cours d'exécution:
```bash
sudo systemctl restart netsecurepro-express
sudo systemctl status netsecurepro-express
```

2. Vérifiez que la configuration du proxy dans Apache est correcte:
```bash
sudo grep -r "ProxyPass" /etc/apache2/sites-enabled/
```

### Problème d'interface - Pages ne se chargent pas

Si l'interface utilisateur ne se charge pas correctement:

1. Vérifiez que le service Flask est en cours d'exécution:
```bash
sudo systemctl restart netsecurepro-flask
sudo systemctl status netsecurepro-flask
```

2. Vérifiez les journaux Flask:
```bash
sudo journalctl -fu netsecurepro-flask
```

3. Vérifiez les erreurs Apache:
```bash
sudo tail -f /var/log/apache2/netsecurepro-error.log
```

## Vérification des fonctionnalités IA

Pour vérifier que les fonctionnalités d'IA fonctionnent correctement:

1. Vérifiez que la clé API OpenAI est configurée:
```bash
sudo cat /var/www/netsecurepro/FlaskServer/.env
```

2. Testez l'analyse de sentiment via l'API:
```bash
curl -X POST http://172.29.81.208/api/ai/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "Le système de sécurité est très efficace."}'
```

3. Testez la génération de résumé via l'API:
```bash
curl -X POST http://172.29.81.208/api/ai/summary \
  -H "Content-Type: application/json" \
  -d '{"text": "NetSecure Pro est une solution avancée de sécurité réseau qui offre une protection complète contre les menaces. Elle combine l'analyse en temps réel avec l'intelligence artificielle pour détecter et neutraliser les risques potentiels avant qu'ils ne causent des dommages."}'
```

4. Testez les recommandations via l'API:
```bash
curl -X POST http://172.29.81.208/api/ai/recommendations \
  -H "Content-Type: application/json" \
  -d '{"description": "Nous recherchons des solutions pour sécuriser notre réseau WiFi d'entreprise avec environ 50 employés."}'
```

## Vérification des performances

Pour surveiller les performances de votre déploiement:

```bash
# Utilisation CPU/mémoire
top

# Espace disque
df -h

# Trafic réseau
sudo apt install -y iftop
sudo iftop -i eth0

# Surveillance des logs en temps réel
sudo tail -f /var/log/apache2/netsecurepro-access.log
```

## Étapes finales

Une fois toutes les vérifications réussies, votre instance NetSecure Pro est correctement déployée et opérationnelle sur votre serveur Ubuntu avec Apache 2.