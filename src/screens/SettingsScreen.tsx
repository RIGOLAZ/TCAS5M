// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Slider,
  Alert 
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useAlarm } from '../hooks/useAlarm';

export const SettingsScreen = () => {
  const { 
    settings, 
    updateAlarmSettings, 
    updateVibrationSettings,
    updateThresholds,
    resetSettings 
  } = useSettings();
  
  const { triggerAlarm } = useAlarm();
  const [activeTab, setActiveTab] = useState<'alarms' | 'vibration' | 'thresholds' | 'general'>('alarms');

  // Test alarme
  const testAlarm = async (level: 'danger' | 'warning' | 'safe') => {
    const levelMap = { danger: 'RESOLUTION', warning: 'TRAFFIC', safe: 'SAFE' };
    await triggerAlarm(levelMap[level] as any);
  };

  // Réinitialiser
  const handleReset = () => {
    Alert.alert(
      'Réinitialiser',
      'Tous les paramètres seront perdus. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: resetSettings 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>⚙️ Paramètres</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['alarms', 'vibration', 'thresholds', 'general'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'alarms' ? '🔔 Alarmes' :
               tab === 'vibration' ? '📳 Vibreur' :
               tab === 'thresholds' ? '📏 Seuils' : '⚡ Général'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* === ONGLET ALARMES === */}
        {activeTab === 'alarms' && (
          <View>
            {(['danger', 'warning', 'safe'] as const).map((level) => (
              <View key={level} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {level === 'danger' ? '🚨 Danger (< 1m)' :
                     level === 'warning' ? '⚠️ Avertissement (< 3m)' :
                     '✅ Sécurisé (> 3m)'}
                  </Text>
                  <Switch
                    value={settings.alarms[level].enabled}
                    onValueChange={(v) => updateAlarmSettings(level, { enabled: v })}
                    trackColor={{ false: '#333', true: '#00FF00' }}
                  />
                </View>

                {settings.alarms[level].enabled && (
                  <>
                    <Text style={styles.label}>Volume: {settings.alarms[level].volume}%</Text>
                    <Slider
                      value={settings.alarms[level].volume}
                      onValueChange={(v) => updateAlarmSettings(level, { volume: v })}
                      minimumValue={0}
                      maximumValue={100}
                      step={10}
                      minimumTrackTintColor="#00FF00"
                      maximumTrackTintColor="#333"
                    />

                    <View style={styles.soundTypes}>
                      {(['beep', 'alarm', 'silent'] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.soundType,
                            settings.alarms[level].soundType === type && styles.soundTypeActive
                          ]}
                          onPress={() => updateAlarmSettings(level, { soundType: type })}
                        >
                          <Text style={styles.soundTypeText}>
                            {type === 'beep' ? '🔔 Bip' :
                             type === 'alarm' ? '🚨 Sirène' : '🔕 Silencieux'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity 
                      style={styles.testButton}
                      onPress={() => testAlarm(level)}
                    >
                      <Text style={styles.testButtonText}>▶️ Tester</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        {/* === ONGLET VIBRATION === */}
        {activeTab === 'vibration' && (
          <View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Activer les vibrations</Text>
                <Switch
                  value={settings.vibration.enabled}
                  onValueChange={(v) => updateVibrationSettings({ enabled: v })}
                  trackColor={{ false: '#333', true: '#00FF00' }}
                />
              </View>
            </View>

            {settings.vibration.enabled && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Intensité</Text>
                  <View style={styles.options}>
                    {(['low', 'medium', 'high'] as const).map((intensity) => (
                      <TouchableOpacity
                        key={intensity}
                        style={[
                          styles.option,
                          settings.vibration.intensity === intensity && styles.optionActive
                        ]}
                        onPress={() => updateVibrationSettings({ intensity })}
                      >
                        <Text style={styles.optionText}>
                          {intensity === 'low' ? '🔋 Faible' :
                           intensity === 'medium' ? '⚡ Moyenne' : '🔌 Forte'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Pattern</Text>
                  <View style={styles.options}>
                    {(['short', 'medium', 'long', 'custom'] as const).map((pattern) => (
                      <TouchableOpacity
                        key={pattern}
                        style={[
                          styles.option,
                          settings.vibration.pattern === pattern && styles.optionActive
                        ]}
                        onPress={() => updateVibrationSettings({ pattern })}
                      >
                        <Text style={styles.optionText}>
                          {pattern === 'short' ? '⚡ Court' :
                           pattern === 'medium' ? '⚡⚡ Moyen' :
                           pattern === 'long' ? '⚡⚡⚡ Long' : '🔧 Personnalisé'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.testButton}
                  onPress={() => triggerAlarm('TRAFFIC')}
                >
                  <Text style={styles.testButtonText}>📳 Tester vibration</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* === ONGLET SEUILS === */}
        {activeTab === 'thresholds' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚨 Danger (cm)</Text>
              <Text style={styles.value}>{settings.thresholds.danger} cm</Text>
              <Slider
                value={settings.thresholds.danger}
                onValueChange={(v) => updateThresholds({ danger: Math.round(v) })}
                minimumValue={50}
                maximumValue={200}
                step={10}
                minimumTrackTintColor="#FF0000"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Avertissement (cm)</Text>
              <Text style={styles.value}>{settings.thresholds.warning} cm</Text>
              <Slider
                value={settings.thresholds.warning}
                onValueChange={(v) => updateThresholds({ warning: Math.round(v) })}
                minimumValue={200}
                maximumValue={400}
                step={10}
                minimumTrackTintColor="#FF8C00"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👀 Attention (cm)</Text>
              <Text style={styles.value}>{settings.thresholds.attention} cm</Text>
              <Slider
                value={settings.thresholds.attention}
                onValueChange={(v) => updateThresholds({ attention: Math.round(v) })}
                minimumValue={400}
                maximumValue={800}
                step={10}
                minimumTrackTintColor="#FFD700"
              />
            </View>
          </View>
        )}

        {/* === ONGLET GÉNÉRAL === */}
        {activeTab === 'general' && (
          <View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Garder l'écran allumé</Text>
                <Switch
                  value={settings.keepScreenOn}
                  onValueChange={(v) => updateSettings({ keepScreenOn: v })}
                  trackColor={{ false: '#333', true: '#00FF00' }}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Intervalle de scan</Text>
              <Text style={styles.value}>{settings.scanInterval} ms</Text>
              <Slider
                value={settings.scanInterval}
                onValueChange={(v) => updateSettings({ scanInterval: Math.round(v) })}
                minimumValue={500}
                maximumValue={5000}
                step={500}
                minimumTrackTintColor="#00FF00"
              />
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>🗑️ Réinitialiser tout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    color: '#00FF00',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00FF00',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    color: '#888',
    marginTop: 10,
    marginBottom: 5,
  },
  value: {
    color: '#00FF00',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  soundTypes: {
    flexDirection: 'row',
    marginTop: 10,
  },
  soundType: {
    flex: 1,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  soundTypeActive: {
    backgroundColor: '#00FF00',
  },
  soundTypeText: {
    color: '#FFF',
    fontSize: 12,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  option: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#333',
    borderRadius: 20,
    margin: 5,
  },
  optionActive: {
    backgroundColor: '#00FF00',
  },
  optionText: {
    color: '#FFF',
  },
  testButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  testButtonText: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});