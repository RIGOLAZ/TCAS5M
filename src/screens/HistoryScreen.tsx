// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProximityAlert, AlertLevel } from '../types';

interface HistoryItem extends ProximityAlert {
  id: string;
}

export const HistoryScreen = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [filter, setFilter] = useState<AlertLevel | 'ALL'>('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('tcas5m_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        const withDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(withDates);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Effacer l\'historique',
      'Toutes les alertes seront supprimées. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Effacer', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('tcas5m_history');
            setHistory([]);
          }
        },
      ]
    );
  };

  const filteredHistory = filter === 'ALL' 
    ? history 
    : history.filter(item => item.level === filter);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getLevelColor = (level: AlertLevel): string => {
    switch (level) {
      case 'RESOLUTION': return '#FF0000';
      case 'TRAFFIC': return '#FF8C00';
      case 'PROXIMATE': return '#FFD700';
      default: return '#00FF00';
    }
  };

  const getLevelIcon = (level: AlertLevel): string => {
    switch (level) {
      case 'RESOLUTION': return '🚨';
      case 'TRAFFIC': return '⚠️';
      case 'PROXIMATE': return '👀';
      default: return '✅';
    }
  };

  const getLevelName = (level: AlertLevel): string => {
    switch (level) {
      case 'RESOLUTION': return 'DANGER';
      case 'TRAFFIC': return 'AVERTISSEMENT';
      case 'PROXIMATE': return 'ATTENTION';
      default: return 'SÛR';
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => setSelectedItem(item)}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: getLevelColor(item.level) + '20' }
      ]}>
        <Text style={styles.icon}>{getLevelIcon(item.level)}</Text>
      </View>
      
      <View style={styles.content}>
        {/* ✅ CORRECTION ICI : un seul attribut style avec array */}
        <Text style={[
          styles.levelText, 
          { color: getLevelColor(item.level) }
        ]}>
          {getLevelName(item.level)}
        </Text>
        <Text style={styles.distance}>{item.distance} cm</Text>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📜 Historique</Text>

      {/* Filtres */}
      <View style={styles.filters}>
        {(['ALL', 'RESOLUTION', 'TRAFFIC', 'PROXIMATE'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filter, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText, 
              filter === f && styles.filterTextActive
            ]}>
              {f === 'ALL' ? 'Tout' :
               f === 'RESOLUTION' ? '🚨' :
               f === 'TRAFFIC' ? '⚠️' : '👀'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats rapides */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{history.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {history.filter(h => h.level === 'RESOLUTION').length}
          </Text>
          <Text style={styles.statLabel}>Dangers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {history.filter(h => {
              const date = new Date(h.timestamp);
              const today = new Date();
              return date.toDateString() === today.toDateString();
            }).length}
          </Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
      </View>

      {/* Liste */}
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Aucune alerte enregistrée</Text>
          <Text style={styles.emptySubtext}>
            Les alertes apparaîtront ici après utilisation du radar
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Boutons actions */}
      {history.length > 0 && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={clearHistory}>
            <Text style={[styles.actionText, styles.deleteText]}>🗑️ Effacer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal détail */}
      <Modal
        visible={selectedItem !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={[
                  styles.modalIcon, 
                  { color: getLevelColor(selectedItem.level) }
                ]}>
                  {getLevelIcon(selectedItem.level)}
                </Text>
                <Text style={styles.modalTitle}>
                  {getLevelName(selectedItem.level)}
                </Text>
                <Text style={styles.modalDistance}>{selectedItem.distance} cm</Text>
                <Text style={styles.modalDate}>
                  {selectedItem.timestamp.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.modalMessage}>{selectedItem.message}</Text>
                
                <TouchableOpacity 
                  style={styles.modalClose}
                  onPress={() => setSelectedItem(null)}
                >
                  <Text style={styles.modalCloseText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  filters: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filter: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  filterActive: {
    backgroundColor: '#00FF00',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#00FF00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  list: {
    padding: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  distance: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    color: '#888',
    fontSize: 24,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionText: {
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#331111',
  },
  deleteText: {
    color: '#FF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 30,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDistance: {
    color: '#00FF00',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalDate: {
    color: '#888',
    fontSize: 12,
    marginBottom: 15,
  },
  modalMessage: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalClose: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#000',
    fontWeight: 'bold',
  },
});