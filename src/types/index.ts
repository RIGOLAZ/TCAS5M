// src/types/index.ts
// Types et interfaces globaux de l'application

// ============================================================
// APPAREILS BLUETOOTH
// ============================================================

/** Type d'appareil détecté */
export type DeviceType = 'PHONE' | 'WATCH' | 'HEADPHONE' | 'CAR' | 'OTHER';

/** Appareil Bluetooth détecté à proximité */
export interface NearbyDevice {
  /** ID unique Bluetooth */
  id: string;
  
  /** Nom de l'appareil (peut être null) */
  name: string | null;
  
  /** Force du signal en dBm (-30 à -100) */
  rssi: number;
  
  /** Distance estimée en centimètres */
  distance: number;
  
  /** Type d'appareil déduit du nom */
  type: DeviceType;
  
  /** Date de dernière détection */
  lastSeen: Date;
  
  /** Position approximative (si connue) */
  position?: {
    latitude: number;
    longitude: number;
  };
}

// ============================================================
// ALERTES ET NIVEAUX
// ============================================================

/** Niveaux d'alerte TCAS (Traffic Collision Avoidance System) */
export type AlertLevel = 'SAFE' | 'PROXIMATE' | 'TRAFFIC' | 'RESOLUTION';

/** Alerte active */
export interface ProximityAlert {
  /** Niveau d'alerte */
  level: AlertLevel;
  
  /** Distance en cm */
  distance: number;
  
  /** Horodatage */
  timestamp: Date;
  
  /** Appareil concerné */
  device?: NearbyDevice;
  
  /** Message pour l'utilisateur */
  message: string;
}

// ============================================================
// CAPTEURS ET POSITION
// ============================================================

/** Données de position et orientation */
export interface PositionData {
  /** Latitude GPS */
  latitude: number;
  
  /** Longitude GPS */
  longitude: number;
  
  /** Altitude en mètres */
  altitude: number | null;
  
  /** Précision en mètres */
  accuracy: number | null;
  
  /** Direction (0-360°, Nord = 0) */
  heading: number | null;
  
  /** Vitesse en m/s */
  speed: number | null;
}

/** Données des capteurs du téléphone */
export interface SensorData {
  /** Accéléromètre (mouvement) */
  accelerometer: {
    x: number;
    y: number;
    z: number;
  } | null;
  
  /** Gyroscope (rotation) */
  gyroscope: {
    x: number;
    y: number;
    z: number;
  } | null;
  
  /** Champ magnétique (boussole) */
  magnetometer: {
    x: number;
    y: number;
    z: number;
  } | null;
}

// ============================================================
// CONFIGURATION
// ============================================================

/** Paramètres de l'application */
export interface AppConfig {
  /** Seuil d'alerte en cm (défaut: 500) */
  alertThreshold: number;
  
  /** Intervalle de scan BLE en ms (défaut: 1000) */
  scanInterval: number;
  
  /** Activer les vibrations */
  hapticEnabled: boolean;
  
  /** Activer les notifications */
  notificationsEnabled: boolean;
  
  /** Type de carte (standard, satellite, hybrid) */
  mapType: 'standard' | 'satellite' | 'hybrid';
}

// ============================================================
// ÉTATS DU SYSTÈME
// ============================================================

/** État de la connexion BLE */
export type BLEState = 'disconnected' | 'scanning' | 'connecting' | 'connected';

/** État global de l'application */
export interface AppState {
  /** État BLE */
  bleState: BLEState;
  
  /** Appareils détectés */
  devices: NearbyDevice[];
  
  /** Alerte active (null si aucune) */
  currentAlert: ProximityAlert | null;
  
  /** Historique des alertes */
  alertHistory: ProximityAlert[];
  
  /** Position actuelle */
  currentPosition: PositionData | null;
  
  /** Erreur éventuelle */
  error: string | null;
}

// ============================================================
// PROPS DES COMPOSANTS
// ============================================================

/** Props pour les écrans de navigation */
export interface ScreenProps {
  navigation: any;  // NavigationProp (simplifié)
  route: any;       // RouteProp (simplifié)
}