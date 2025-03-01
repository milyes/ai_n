/**
 * Service d'authentification pour le système NetSecure Pro
 * Gère les vérifications d'authentification et les sessions pour l'accès administrateur
 */

// Durée de session en millisecondes (2 heures)
const SESSION_DURATION = 2 * 60 * 60 * 1000;

/**
 * Vérifie si l'utilisateur est actuellement authentifié en tant qu'administrateur
 * @returns {boolean} true si l'authentification est valide, sinon false
 */
export function isAdminAuthenticated(): boolean {
  const isAuth = localStorage.getItem('admin_authenticated');
  const timestamp = localStorage.getItem('admin_timestamp');
  
  if (!isAuth || !timestamp) {
    return false;
  }
  
  // Vérifier si la session n'est pas expirée
  const authTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  
  if (currentTime - authTime > SESSION_DURATION) {
    // Session expirée, nettoyer le stockage
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_timestamp');
    return false;
  }
  
  return isAuth === 'true';
}

/**
 * Déconnecte l'administrateur en supprimant les données d'authentification
 */
export function logoutAdmin(): void {
  localStorage.removeItem('admin_authenticated');
  localStorage.removeItem('admin_timestamp');
}

/**
 * Rafraîchit la session administrateur en mettant à jour le timestamp
 */
export function refreshAdminSession(): void {
  if (isAdminAuthenticated()) {
    localStorage.setItem('admin_timestamp', Date.now().toString());
  }
}

/**
 * Obtient le temps restant de la session en minutes
 * @returns {number} Minutes restantes de la session ou 0 si non authentifié
 */
export function getSessionTimeRemaining(): number {
  const timestamp = localStorage.getItem('admin_timestamp');
  
  if (!timestamp || !isAdminAuthenticated()) {
    return 0;
  }
  
  const authTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  const remainingMs = SESSION_DURATION - (currentTime - authTime);
  
  if (remainingMs <= 0) {
    logoutAdmin();
    return 0;
  }
  
  return Math.floor(remainingMs / (60 * 1000)); // Conversion en minutes
}