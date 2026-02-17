// src/utils/distance.ts
// Fonctions utilitaires pour calculs de distance

/**
 * Calcule la distance entre deux points GPS (coordoonnées)
 * Formule de Haversine
 */
export const calculateGPSDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance en mètres
};

/**
 * Calcule distance depuis RSSI Bluetooth (approximation)
 * RSSI = Puissance reçue en dBm
 * txPower = Puissance émise à 1m (typiquement -59 dBm)
 */
export const calculateBLEDistance = (
  rssi: number,
  txPower: number = -59,
  n: number = 2.5
): number => {
  if (rssi >= 0) return 999; // Valeur invalide
  
  // Formule: d = 10^((txPower - RSSI)/(10*n))
  const distance = Math.pow(10, (txPower - rssi) / (10 * n));
  
  // Convertir en cm et limiter
  const distanceCm = Math.round(distance * 100);
  return Math.min(distanceCm, 999);
};

/**
 * Convertit cm en format lisible
 */
export const formatDistance = (cm: number): string => {
  if (cm >= 999) return 'Hors portée';
  if (cm >= 100) return `${(cm / 100).toFixed(1)} m`;
  return `${cm} cm`;
};

/**
 * Détermine le niveau d'alerte TCAS
 */
export type AlertLevel = 'SAFE' | 'PROXIMATE' | 'TRAFFIC' | 'RESOLUTION';

export const getAlertLevel = (distanceCm: number): AlertLevel => {
  if (distanceCm < 100) return 'RESOLUTION';  // < 1m
  if (distanceCm < 300) return 'TRAFFIC';     // < 3m
  if (distanceCm < 500) return 'PROXIMATE';   // < 5m
  return 'SAFE';
};

/**
 * Couleur associée au niveau d'alerte
 */
export const getAlertColor = (level: AlertLevel): string => {
  switch (level) {
    case 'RESOLUTION': return '#FF0000';  // Rouge
    case 'TRAFFIC':    return '#FF8C00';  // Orange
    case 'PROXIMATE':  return '#FFD700';  // Jaune
    case 'SAFE':       return '#00FF00';  // Vert
    default:           return '#00FF00';
  }
};

/**
 * Texte associé au niveau d'alerte
 */
export const getAlertText = (level: AlertLevel): string => {
  switch (level) {
    case 'RESOLUTION': return 'DANGER COLLISION';
    case 'TRAFFIC':    return 'ALERTE PROXIMITÉ';
    case 'PROXIMATE':  return 'ATTENTION';
    case 'SAFE':       return 'ZONE SÛRE';
  }
};