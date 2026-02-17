// src/components/CustomDrawer.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useSettings } from '../context/SettingsContext';

export const CustomDrawer: React.FC<DrawerContentComponentProps> = (props) => {
  const { settings } = useSettings();

  return (
    <View style={styles.container}>
      {/* Header avec logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🎯</Text>
        </View>
        <Text style={styles.title}>TCAS-5M</Text>
        <Text style={styles.subtitle}>Système Anti-Collision</Text>
        
        {/* Status rapide */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {settings.vibration.enabled ? '🔔 Vibrations ON' : '🔕 Vibrations OFF'}
          </Text>
        </View>
      </View>

      {/* Menu items */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.menu}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2024 TCAS5M</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00FF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#000',
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    color: '#00FF00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#333',
    borderRadius: 15,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
  },
  menu: {
    paddingTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  version: {
    color: '#666',
    fontSize: 12,
  },
  copyright: {
    color: '#444',
    fontSize: 10,
    marginTop: 5,
  },
});