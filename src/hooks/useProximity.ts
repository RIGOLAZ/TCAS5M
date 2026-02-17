// src/hooks/useProximity.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../context/SettingsContext';
import { useAlarm } from './useAlarm';
import { NearbyDevice, AlertLevel, ProximityAlert } from '../types';

export const useProximity = () => {
  const [manager] = useState(() => new BleManager());
  const [nearbyDevices, setNearbyDevices] = useState<NearbyDevice[]>([]);
  const [closestDistance, setClosestDistance] = useState<number>(999);
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState(0);
  
  const { settings } = useSettings();
  const { triggerAlarm } = useAlarm();
  
  const scanInterval = useRef<NodeJS.Timeout | null>(null);
  const devicesMap = useRef<Map<string, NearbyDevice>>(new Map());
  const lastAlertTime = useRef<number>(0);

  // Demander permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(result).every(v => v === 'granted');
    }
    return true;
  };

  // Calculer distance depuis RSSI
  const calculateDistance = (rssi: number): number => {
    const txPower = -59;
    const n = 2.5;
    
    if (rssi === 0) return 999;
    
    const distance = Math.pow(10, (txPower - rssi) / (10 * n));
    return Math.min(Math.round(distance * 100), 999);
  };

  // Détecter type d'appareil
  const detectDeviceType = (name: string | null): NearbyDevice['type'] => {
    if (!name) return 'OTHER';
    const lower = name.toLowerCase();
    if (lower.includes('watch') || lower.includes('montre') || lower.includes('galaxy watch') || lower.includes('apple watch')) return 'WATCH';
    if (lower.includes('phone') || lower.includes('iphone') || lower.includes('samsung') || lower.includes('xiaomi') || lower.includes('pixel')) return 'PHONE';
    if (lower.includes('airpods') || lower.includes('buds') || lower.includes('headphone') || lower.includes('casque') || lower.includes('earbuds')) return 'HEADPHONE';
    if (lower.includes('car') || lower.includes('auto') || lower.includes('tesla') || lower.includes('bmw')) return 'CAR';
    return 'OTHER';
  };

  // Sauvegarder alerte dans historique
  const saveAlertToHistory = async (alert: ProximityAlert) => {
    try {
      const saved = await AsyncStorage.getItem('tcas5m_history');
      const history = saved ? JSON.parse(saved) : [];
      
      const newAlert = {
        ...alert,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      
      const updated = [newAlert, ...history].slice(0, 100);
      await AsyncStorage.setItem('tcas5m_history', JSON.stringify(updated));
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  };

  // Déterminer niveau d'alerte
  const getAlertLevel = (distance: number): AlertLevel => {
    if (distance < settings.thresholds.danger) return 'RESOLUTION';
    if (distance < settings.thresholds.warning) return 'TRAFFIC';
    if (distance < settings.thresholds.attention) return 'PROXIMATE';
    return 'SAFE';
  };

  // Gérer les alertes avec anti-spam
  const handleAlert = useCallback((distance: number) => {
    const level = getAlertLevel(distance);
    const now = Date.now();
    
    // Anti-spam: minimum 2 secondes entre alertes
    if (level !== 'SAFE' && now - lastAlertTime.current > 2000) {
      lastAlertTime.current = now;
      
      const alert: ProximityAlert = {
        level,
        distance,
        timestamp: new Date(),
        message: level === 'RESOLUTION' ? 'Danger collision immédiate !' :
                 level === 'TRAFFIC' ? 'Objet proche détecté' :
                 'Attention proximité',
      };
      
      triggerAlarm(level);
      saveAlertToHistory(alert);
    }
  }, [settings.thresholds, triggerAlarm]);

  // Démarrer le scan BLE
  const startScanning = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.error('Permissions refusées');
      return;
    }

    setIsScanning(true);
    devicesMap.current.clear();

    // Obtenir position et boussole
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
    
    Location.watchHeadingAsync((headingData) => {
      setHeading(headingData.trueHeading);
    });

    // Scan BLE continu
    manager.startDeviceScan(
      null,
      { allowDuplicates: true },
      (error, device) => {
        if (error || !device) return;
        if (device.rssi === null || device.rssi === undefined) return;

        const distance = calculateDistance(device.rssi);
        const deviceType = detectDeviceType(device.name);

        const nearbyDevice: NearbyDevice = {
          id: device.id,
          name: device.name || `Appareil_${device.id.slice(-4)}`,
          rssi: device.rssi,
          distance: distance,
          type: deviceType,
          lastSeen: new Date(),
        };

        devicesMap.current.set(device.id, nearbyDevice);
      }
    );

    // Mettre à jour l'état toutes les secondes
    scanInterval.current = setInterval(() => {
      const devices = Array.from(devicesMap.current.values());
      
      // Filtrer appareils actifs (vus il y a < 5s)
      const activeDevices = devices.filter(d => {
        const age = Date.now() - d.lastSeen.getTime();
        return age < 5000;
      });

      // Trier par distance
      activeDevices.sort((a, b) => a.distance - b.distance);
      
      setNearbyDevices(activeDevices);
      
      const closest = activeDevices[0]?.distance || 999;
      setClosestDistance(closest);
      
      // Gérer les alertes
      handleAlert(closest);
      
    }, settings.scanInterval);

  }, [manager, settings.scanInterval, handleAlert]);

  // Arrêter le scan
  const stopScanning = useCallback(() => {
    manager.stopDeviceScan();
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
    }
    setIsScanning(false);
  }, [manager]);

  // Nettoyage
  useEffect(() => {
    return () => {
      stopScanning();
      manager.destroy();
    };
  }, [manager, stopScanning]);

  return {
    startScanning,
    stopScanning,
    isScanning,
    nearbyDevices,
    closestDistance,
    location,
    heading,
    deviceCount: nearbyDevices.length,
  };
};