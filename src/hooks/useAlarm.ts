// src/hooks/useAlarm.ts
import { useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';
import { AlertLevel } from '../types';

export const useAlarm = () => {
  const { settings } = useSettings();
  const soundRef = useRef<Audio.Sound | null>(null);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Jouer le son selon le niveau
  const playAlarmSound = useCallback(async (level: AlertLevel) => {
    const alarmSettings = settings.alarms[level === 'RESOLUTION' ? 'danger' : 
                                         level === 'TRAFFIC' ? 'warning' : 'safe'];
    
    if (!alarmSettings.enabled || alarmSettings.soundType === 'silent') {
      return;
    }

    try {
      // Arrêter son précédent
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      // Charger et jouer le nouveau son
      const soundFile = getSoundFile(alarmSettings.soundType, level);
      
      const { sound } = await Audio.Sound.createAsync(
        soundFile,
        { 
          volume: alarmSettings.volume / 100,
          shouldPlay: true,
          isLooping: level === 'RESOLUTION', // Boucle en danger
        }
      );
      
      soundRef.current = sound;
      
    } catch (error) {
      console.error('Erreur lecture son:', error);
    }
  }, [settings.alarms]);

  // Arrêter le son
  const stopAlarm = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
  }, []);

  // Vibration selon les paramètres
  const triggerVibration = useCallback(async (level: AlertLevel) => {
    if (!settings.vibration.enabled) return;

    const { pattern, intensity, customPattern } = settings.vibration;

    // Haptics pour iOS (plus précis)
    if (intensity === 'high') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (intensity === 'medium') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Vibration Android + pattern personnalisé
    let vibrationPattern: number[];

    switch (level) {
      case 'RESOLUTION':
        vibrationPattern = customPattern || [0, 500, 200, 500, 200, 500];
        break;
      case 'TRAFFIC':
        vibrationPattern = pattern === 'short' ? [0, 300] :
                          pattern === 'long' ? [0, 500, 200, 500] :
                          [0, 400, 100, 400];
        break;
      case 'PROXIMATE':
        vibrationPattern = pattern === 'short' ? [0, 200] : [0, 300];
        break;
      default:
        vibrationPattern = [0, 100];
    }

    Vibration.vibrate(vibrationPattern);
  }, [settings.vibration]);

  // Alarme complète (son + vibration)
  const triggerAlarm = useCallback(async (level: AlertLevel) => {
    await Promise.all([
      playAlarmSound(level),
      triggerVibration(level),
    ]);
  }, [playAlarmSound, triggerVibration]);

  return {
    triggerAlarm,
    stopAlarm,
    playAlarmSound,
    triggerVibration,
  };
};

// Helper pour choisir le fichier son
const getSoundFile = (soundType: string, level: AlertLevel) => {
  if (soundType === 'custom') {
    return { uri: 'asset:/sounds/custom_alarm.wav' };
  }
  
  // Sons par défaut selon niveau
  switch (level) {
    case 'RESOLUTION':
      return require('../../assets/sounds/alarm_danger.wav');
    case 'TRAFFIC':
      return require('../../assets/sounds/alarm_warning.wav');
    default:
      return require('../../assets/sounds/alarm_safe.wav');
  }
};