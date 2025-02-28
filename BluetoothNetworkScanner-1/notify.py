import os
from twilio.rest import Client

def send_wifi_notification(network_info: str, to_phone: str) -> None:
    """
    Envoie une notification SMS via Twilio quand un nouveau réseau WiFi est détecté
    """
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    from_phone = os.environ.get('TWILIO_PHONE_NUMBER')

    if not all([account_sid, auth_token, from_phone]):
        print("Configuration Twilio manquante. Les notifications SMS sont désactivées.")
        return

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=f"Nouveau réseau WiFi détecté:\n{network_info}",
            from_=from_phone,
            to=to_phone
        )
        print(f"Notification SMS envoyée (SID: {message.sid})")
    except Exception as e:
        print(f"Erreur lors de l'envoi du SMS: {str(e)}")