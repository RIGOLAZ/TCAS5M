// src/screens/TutorialScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const tutorialPages = [
  {
    icon: '🎯',
    title: 'Bienvenue sur TCAS-5M',
    description: 'Le système de détection de proximité qui protège votre espace personnel. Détectez les personnes et objets à moins de 5 mètres.',
  },
  {
    icon: '📡',
    title: 'Comment ça marche ?',
    description: 'L\'application scanne en permanence les appareils Bluetooth environnants (téléphones, montres, enceintes) et calcule leur distance approximative.',
  },
  {
    icon: '🗺️',
    title: 'Radar sur carte',
    description: 'Visualisez votre position et les appareils détectés sur Google Maps. Les cercles colorés indiquent les zones de danger.',
  },
  {
    icon: '🚨',
    title: 'Alertes intelligentes',
    description: 'Trois niveaux d\'alerte :\n🔴 Danger (< 1m) - Vibration forte + sirène\n🟠 Avertissement (< 3m) - Vibration moyenne\n🟡 Attention (< 5m) - Signal discret',
  },
  {
    icon: '⚙️',
    title: 'Personnalisation',
    description: 'Dans les paramètres, personnalisez :\n• Intensité des vibrations\n• Sons d\'alerte\n• Seuils de détection\n• Intervalle de scan',
  },
  {
    icon: '🔋',
    title: 'Économie d\'énergie',
    description: 'L\'application optimise l\'utilisation du Bluetooth et du GPS pour préserver votre batterie. Activez "Garder l\'écran allumé" en mode continu.',
  },
  {
    icon: '🔒',
    title: 'Confidentialité',
    description: 'Vos données restent sur votre téléphone. Aucune information n\'est envoyée sur nos serveurs. L\'application fonctionne hors-ligne.',
  },
  {
    icon: '🚀',
    title: 'Prêt à démarrer !',
    description: 'Appuyez sur le bouton radar pour commencer le scan. Restez vigilant et respectez les distances de sécurité.',
  },
];

export const TutorialScreen = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < tutorialPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const page = tutorialPages[currentPage];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Tutoriel</Text>
      
      <View style={styles.progressContainer}>
        {tutorialPages.map((_, index) => (
          <View 
            key={index}
            style={[
              styles.progressDot,
              index === currentPage && styles.progressDotActive,
              index < currentPage && styles.progressDotCompleted
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>{page.icon}</Text>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
          onPress={prevPage}
          disabled={currentPage === 0}
        >
          <Text style={styles.navButtonText}>◀ Précédent</Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {currentPage + 1} / {tutorialPages.length}
        </Text>

        <TouchableOpacity 
          style={[styles.navButton, currentPage === tutorialPages.length - 1 && styles.navButtonDone]}
          onPress={nextPage}
          disabled={currentPage === tutorialPages.length - 1}
        >
          <Text style={styles.navButtonText}>
            {currentPage === tutorialPages.length - 1 ? '✅ Terminé' : 'Suivant ▶'}
          </Text>
        </TouchableOpacity>
      </View>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#00FF00',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#00FF00',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  icon: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    color: '#AAA',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonDone: {
    backgroundColor: '#00FF00',
  },
  navButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  pageIndicator: {
    color: '#888',
    fontSize: 14,
  },
});