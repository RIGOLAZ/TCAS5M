// src/screens/StatsScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProximityAlert, AlertLevel } from '../types';

const { width } = Dimensions.get('window');

interface StatsData {
  totalAlerts: number;
  dangerCount: number;
  warningCount: number;
  attentionCount: number;
  safeCount: number;
  averageDistance: number;
  closestEncounter: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  hourlyDistribution: number[];
  dailyDistribution: number[];
}

export const StatsScreen = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    calculateStats();
  }, [timeRange]);

  const calculateStats = async () => {
    try {
      const saved = await AsyncStorage.getItem('tcas5m_history');
      if (!saved) {
        setStats(null);
        return;
      }

      const history: ProximityAlert[] = JSON.parse(saved).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));

      // Filtrer selon période
      const now = new Date();
      const filtered = history.filter((item) => {
        const date = new Date(item.timestamp);
        const diff = now.getTime() - date.getTime();
        
        switch (timeRange) {
          case 'day': return diff < 86400000;
          case 'week': return diff < 604800000;
          case 'month': return diff < 2592000000;
          default: return true;
        }
      });

      // Calculer stats
      const danger = filtered.filter(h => h.level === 'RESOLUTION').length;
      const warning = filtered.filter(h => h.level === 'TRAFFIC').length;
      const attention = filtered.filter(h => h.level === 'PROXIMATE').length;
      const safe = filtered.filter(h => h.level === 'SAFE').length;

      const distances = filtered.map(h => h.distance).filter(d => d < 999);
      const avgDistance = distances.length > 0 
        ? Math.round(distances.reduce((a, b) => a + b, 0) / distances.length) 
        : 0;
      const closest = distances.length > 0 ? Math.min(...distances) : 0;

      // Distribution horaire
      const hourlyDist = new Array(24).fill(0);
      filtered.forEach(h => {
        const hour = new Date(h.timestamp).getHours();
        hourlyDist[hour]++;
      });

      // Distribution journalière (7 derniers jours)
      const dailyDist = new Array(7).fill(0);
      filtered.forEach(h => {
        const day = new Date(h.timestamp).getDay();
        dailyDist[day]++;
      });

      setStats({
        totalAlerts: filtered.length,
        dangerCount: danger,
        warningCount: warning,
        attentionCount: attention,
        safeCount: safe,
        averageDistance: avgDistance,
        closestEncounter: closest,
        todayCount: history.filter(h => {
          const d = new Date(h.timestamp);
          const today = new Date();
          return d.toDateString() === today.toDateString();
        }).length,
        weekCount: history.filter(h => {
          const d = new Date(h.timestamp);
          const weekAgo = new Date(Date.now() - 604800000);
          return d > weekAgo;
        }).length,
        monthCount: history.filter(h => {
          const d = new Date(h.timestamp);
          const monthAgo = new Date(Date.now() - 2592000000);
          return d > monthAgo;
        }).length,
        hourlyDistribution: hourlyDist,
        dailyDistribution: dailyDist,
      });

    } catch (error) {
      console.error('Erreur calcul stats:', error);
    }
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>📊 Statistiques</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyText}>Pas assez de données</Text>
          <Text style={styles.emptySubtext}>
            Utilisez l'application pour générer des statistiques
          </Text>
        </View>
      </View>
    );
  }

  const maxHourly = Math.max(...stats.hourlyDistribution, 1);
  const maxDaily = Math.max(...stats.dailyDistribution, 1);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📊 Statistiques</Text>

      {/* Sélecteur de période */}
      <View style={styles.periodSelector}>
        {(['day', 'week', 'month', 'all'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, timeRange === p && styles.periodButtonActive]}
            onPress={() => setTimeRange(p)}
          >
            <Text style={[styles.periodText, timeRange === p && styles.periodTextActive]}>
              {p === 'day' ? '24h' : p === 'week' ? '7j' : p === 'month' ? '30j' : 'Tout'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cartes principales */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>{stats.totalAlerts}</Text>
          <Text style={styles.cardLabel}>Alertes totales</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>{stats.averageDistance}cm</Text>
          <Text style={styles.cardLabel}>Distance moyenne</Text>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={[styles.cardNumber, styles.dangerText]}>{stats.closestEncounter}cm</Text>
          <Text style={styles.cardLabel}>Plus proche rencontre</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>{stats.todayCount}</Text>
          <Text style={styles.cardLabel}>Aujourd'hui</Text>
        </View>
      </View>

      {/* Répartition par type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Répartition des alertes</Text>
        
        <View style={styles.barContainer}>
          <View style={styles.barLabel}>
            <Text style={styles.barText}>🚨 Danger</Text>
            <Text style={styles.barValue}>{stats.dangerCount}</Text>
          </View>
          <View style={styles.barBackground}>
            <View 
              style={[
                styles.barFill, 
                styles.dangerBar,
                { width: `${(stats.dangerCount / Math.max(stats.totalAlerts, 1)) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.barContainer}>
          <View style={styles.barLabel}>
            <Text style={styles.barText}>⚠️ Avertissement</Text>
            <Text style={styles.barValue}>{stats.warningCount}</Text>
          </View>
          <View style={styles.barBackground}>
            <View 
              style={[
                styles.barFill, 
                styles.warningBar,
                { width: `${(stats.warningCount / Math.max(stats.totalAlerts, 1)) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.barContainer}>
          <View style={styles.barLabel}>
            <Text style={styles.barText}>👀 Attention</Text>
            <Text style={styles.barValue}>{stats.attentionCount}</Text>
          </View>
          <View style={styles.barBackground}>
            <View 
              style={[
                styles.barFill, 
                styles.attentionBar,
                { width: `${(stats.attentionCount / Math.max(stats.totalAlerts, 1)) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Graphique horaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activité par heure</Text>
        <View style={styles.chart}>
          {stats.hourlyDistribution.map((count, hour) => (
            <View key={hour} style={styles.barWrapper}>
              <View 
                style={[
                  styles.chartBar,
                  { height: `${(count / maxHourly) * 100}%` }
                ]} 
              />
              {hour % 4 === 0 && (
                <Text style={styles.chartLabel}>{hour}h</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Activité hebdomadaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activité hebdomadaire</Text>
        <View style={styles.weekChart}>
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, index) => (
            <View key={day} style={styles.dayColumn}>
              <View style={styles.dayBarContainer}>
                <View 
                  style={[
                    styles.dayBar,
                    { height: `${(stats.dailyDistribution[index] / maxDaily) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.dayLabel}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Résumé */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>📈 Résumé</Text>
        <Text style={styles.summaryText}>
          Cette semaine : <Text style={styles.summaryHighlight}>{stats.weekCount}</Text> alertes
        </Text>
        <Text style={styles.summaryText}>
          Ce mois : <Text style={styles.summaryHighlight}>{stats.monthCount}</Text> alertes
        </Text>
        <Text style={styles.summaryText}>
          Taux de danger : <Text style={styles.dangerText}>
            {((stats.dangerCount / Math.max(stats.totalAlerts, 1)) * 100).toFixed(1)}%
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

// Ajout du import manquant
import { TouchableOpacity } from 'react-native';

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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  periodButtonActive: {
    backgroundColor: '#00FF00',
  },
  periodText: {
    color: '#888',
    fontSize: 14,
  },
  periodTextActive: {
    color: '#000',
    fontWeight: 'bold',
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
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: width * 0.42,
    alignItems: 'center',
  },
  dangerCard: {
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  cardNumber: {
    color: '#00FF00',
    fontSize: 28,
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#FF0000',
  },
  cardLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  barContainer: {
    marginBottom: 15,
  },
  barLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barText: {
    color: '#FFF',
    fontSize: 14,
  },
  barValue: {
    color: '#888',
    fontSize: 14,
  },
  barBackground: {
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  dangerBar: {
    backgroundColor: '#FF0000',
  },
  warningBar: {
    backgroundColor: '#FF8C00',
  },
  attentionBar: {
    backgroundColor: '#FFD700',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chartBar: {
    width: 8,
    backgroundColor: '#00FF00',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    color: '#888',
    fontSize: 10,
    marginTop: 5,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 150,
    alignItems: 'flex-end',
    paddingTop: 20,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayBarContainer: {
    height: 120,
    justifyContent: 'flex-end',
  },
  dayBar: {
    width: 30,
    backgroundColor: '#00FF00',
    borderRadius: 5,
    minHeight: 4,
  },
  dayLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  summary: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 15,
    borderRadius: 15,
  },
  summaryTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 5,
  },
  summaryHighlight: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
});