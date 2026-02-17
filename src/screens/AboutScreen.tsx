// src/screens/AboutScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const features = [
  { icon: '📡', title: 'Détection BLE', desc: 'Scanne les appareils Bluetooth environnants' },
  { icon: '🗺️', title: 'Carte en temps réel', desc: 'Visualisation GPS avec Google Maps' },
  { icon: '🚨', title: 'Alertes configurables', desc: '3 niveaux d\'alerte personnalisables' },
  { icon: '📳', title: 'Vibrations intelligentes', desc: 'Patterns adaptatifs selon la distance' },
  { icon: '🔋', title: 'Économie d\'énergie', desc: 'Optimisation de la batterie' },
  { icon: '🔒', title: '100% Offline', desc: 'Aucune donnée envoyée aux serveurs' },
  { icon: '♿', title: 'Accessibilité', desc: 'Interface adaptée aux malvoyants' },
  { icon: '🆓', title: 'Gratuit', desc: 'Sans publicité, sans abonnement' },
];

export const AboutScreen = () => {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎯</Text>
        <Text style={styles.title}>TCAS-5M</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.tagline}>Votre système anti-collision personnel</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Fonctionnalités</Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Cas d'usage</Text>
        <View style={styles.useCase}>
          <Text style={styles.useCaseTitle}>👥 Distanciation sociale</Text>
          <Text style={styles.useCaseDesc}>
            Maintenez une distance de sécurité dans les lieux publics, 
            magasins, transports en commun.
          </Text>
        </View>
        <View style={styles.useCase}>
          <Text style={styles.useCaseTitle}>🏃 Sport & Activités</Text>
          <Text style={styles.useCaseDesc}>
            Course à pied, vélo, randonnée : soyez alerté des autres 
            sportifs ou cyclistes approchants.
          </Text>
        </View>
        <View style={styles.useCase}>
          <Text style={styles.useCaseTitle}>👨‍🦯 Accessibilité</Text>
          <Text style={styles.useCaseDesc}>
            Aide à la navigation pour personnes malvoyantes ou 
            déficientes visuelles.
          </Text>
        </View>
        <View style={styles.useCase}>
          <Text style={styles.useCaseTitle}>🏗️ Chantiers & Industrie</Text>
          <Text style={styles.useCaseDesc}>
            Sécurité des piétons dans les zones de manutention, 
            entrepôts, chantiers.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ Besoin d'aide ?</Text>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => openLink('mailto:support@tcas5m.app')}
        >
          <Text style={styles.linkText}>📧 Contacter le support</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => openLink('https://tcas5m.app/faq')}
        >
          <Text style={styles.linkText}>❓ FAQ en ligne</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 TCAS5M. Tous droits réservés.</Text>
        <Text style={styles.footerText}>Made with 💚 pour votre sécurité</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    color: '#00FF00',
    fontSize: 32,
    fontWeight: 'bold',
  },
  version: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  tagline: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    fontSize: 28,
    width: 50,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  featureDesc: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  useCase: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  useCaseTitle: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  useCaseDesc: {
    color: '#AAA',
    fontSize: 13,
    lineHeight: 18,
  },
  linkButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#00FF00',
    fontSize: 14,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
});