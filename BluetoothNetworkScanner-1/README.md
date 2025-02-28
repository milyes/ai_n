TEST_MODE=true bash wifi_detect.sh     # Pour tester la détection WiFi
TEST_MODE=true bash lte_detect.sh      # Pour tester la détection LTE
TEST_MODE=true bash bluetooth_detect.sh # Pour tester la détection Bluetooth
TEST_MODE=true bash esim_detect.sh     # Pour tester la détection e-SIM
```

Pour configurer les notifications SMS sur Replit :
1. Ajoutez vos identifiants Twilio dans les Secrets :
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE_NUMBER
   - NOTIFICATION_PHONE

## Installation sur Termux (Android)

1. Installez les dépendances :
   ```bash
   pkg update
   pkg install root-repo
   pkg install wireless-tools
   ```

2. Clonez ce dépôt :
   ```bash
   git clone [URL_DU_DEPOT]
   cd [NOM_DU_DOSSIER]
   ```

3. Donnez les permissions nécessaires :
   ```bash
   termux-setup-storage
   ```

4. Lancez le script d'installation :
   ```bash
   bash install.sh
   ```

5. Configurez les variables d'environnement pour les notifications SMS :
   ```bash
   export TWILIO_ACCOUNT_SID="votre_account_sid"
   export TWILIO_AUTH_TOKEN="votre_auth_token"
   export TWILIO_PHONE_NUMBER="votre_numero_twilio"
   export NOTIFICATION_PHONE="votre_numero_personnel"
   ```

6. Activez les scripts :
   ```bash
   source ~/.network_detect/wifi_detect.sh
   source ~/.network_detect/lte_detect.sh
   source ~/.network_detect/bluetooth_detect.sh
   source ~/.network_detect/esim_detect.sh
   ```

## Installation sur Ubuntu/Debian

1. Installez les dépendances système :
   ```bash
   sudo apt-get update
   sudo apt-get install wireless-tools modemmanager python3-pip bluetooth
   ```

2. Installez les dépendances Python :
   ```bash
   pip3 install twilio
   ```

3. Lancez le script d'installation :
   ```bash
   bash install.sh
   ```

## Configuration des Notifications SMS

Pour activer les notifications SMS via Twilio :

1. Créez un compte sur [Twilio](https://www.twilio.com)
2. Obtenez vos identifiants Twilio (Account SID et Auth Token)
3. Configurez les variables d'environnement :
   - TWILIO_ACCOUNT_SID : Votre Account SID Twilio
   - TWILIO_AUTH_TOKEN : Votre Auth Token Twilio
   - TWILIO_PHONE_NUMBER : Le numéro Twilio attribué (format international, ex: +33612345678)
   - NOTIFICATION_PHONE : Votre numéro de téléphone personnel (format international)

## Mode Test

Le mode test permet de simuler la détection des réseaux sans matériel physique :
```bash
TEST_MODE=true bash wifi_detect.sh     # Pour tester la détection WiFi
TEST_MODE=true bash lte_detect.sh      # Pour tester la détection LTE
TEST_MODE=true bash bluetooth_detect.sh # Pour tester la détection Bluetooth
TEST_MODE=true bash esim_detect.sh     # Pour tester la détection e-SIM
```

## Résolution des problèmes

- Les journaux sont stockés dans : `~/.network_detect/network_detect.log`
- Pour Termux :
  - Vérifiez que le WiFi et les données mobiles sont activés dans les paramètres Android
  - Vérifiez que Termux a les permissions réseau nécessaires
  - Pour les appareils rootés, assurez-vous d'avoir les permissions root correctes
- Pour Ubuntu/Debian :
  - En cas d'erreur de permission :
    ```bash
    sudo usermod -a -G netdev $USER
    sudo usermod -a -G dialout $USER  # Pour l'accès aux modems LTE
    sudo usermod -a -G bluetooth $USER # Pour l'accès au Bluetooth