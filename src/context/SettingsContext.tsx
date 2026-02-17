// src/context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types des paramètres
export interface AlarmSettings {
  enabled: boolean;
  volume: number;        // 0-100
  soundType: 'beep' | 'alarm' | 'silent' | 'custom';
  customSoundUri?: string;
}

export interface VibrationSettings {
  enabled: boolean;
  pattern: 'short' | 'medium' | 'long' | 'custom';
  intensity: 'low' | 'medium' | 'high';
  customPattern?: number[];  // En ms: [attente, vibre, pause, vibre...]
}

export interface ThresholdSettings {
  danger: number;        // cm (défaut: 100)
  warning: number;       // cm (défaut: 300)
  attention: number;     // cm (défaut: 500)
}

export interface AppSettings {
  alarms: {
    danger: AlarmSettings;
    warning: AlarmSettings;
    safe: AlarmSettings;
  };
  vibration: VibrationSettings;
  thresholds: ThresholdSettings;
  mapType: 'standard' | 'satellite' | 'hybrid';
  scanInterval: number;  // ms
  keepScreenOn: boolean;
  darkMode: boolean;
}

const defaultSettings: AppSettings = {
  alarms: {
    danger: {
      enabled: true,
      volume: 100,
      soundType: 'alarm',
    },
    warning: {
      enabled: true,
      volume: 70,
      soundType: 'beep',
    },
    safe: {
      enabled: false,
      volume: 50,
      soundType: 'silent',
    },
  },
  vibration: {
    enabled: true,
    pattern: 'medium',
    intensity: 'high',
    customPattern: [0, 500, 200, 500], // Attente, vibre, pause, vibre
  },
  thresholds: {
    danger: 100,    // < 1m
    warning: 300,   // < 3m
    attention: 500, // < 5m
  },
  mapType: 'standard',
  scanInterval: 1000,
  keepScreenOn: true,
  darkMode: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  updateAlarmSettings: (level: 'danger' | 'warning' | 'safe', settings: Partial<AlarmSettings>) => Promise<void>;
  updateVibrationSettings: (settings: Partial<VibrationSettings>) => Promise<void>;
  updateThresholds: (thresholds: Partial<ThresholdSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('tcas5m_settings');
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('tcas5m_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  };

  const updateAlarmSettings = async (
    level: 'danger' | 'warning' | 'safe',
    alarmSettings: Partial<AlarmSettings>
  ) => {
    const updated = {
      ...settings,
      alarms: {
        ...settings.alarms,
        [level]: { ...settings.alarms[level], ...alarmSettings },
      },
    };
    setSettings(updated);
    await saveSettings(updated);
  };

  const updateVibrationSettings = async (vibrationSettings: Partial<VibrationSettings>) => {
    const updated = {
      ...settings,
      vibration: { ...settings.vibration, ...vibrationSettings },
    };
    setSettings(updated);
    await saveSettings(updated);
  };

  const updateThresholds = async (thresholds: Partial<ThresholdSettings>) => {
    const updated = {
      ...settings,
      thresholds: { ...settings.thresholds, ...thresholds },
    };
    setSettings(updated);
    await saveSettings(updated);
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    await saveSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateAlarmSettings,
        updateVibrationSettings,
        updateThresholds,
        resetSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings doit être utilisé dans SettingsProvider');
  }
  return context;
};