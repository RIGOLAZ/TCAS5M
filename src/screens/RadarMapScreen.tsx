// src/screens/RadarMapScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useProximity } from '../hooks/useProximity';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const RadarMapScreen = () => {
  const { 
    startScanning, 
    stopScanning, 
    isScanning, 
    nearbyDevices, 
    closestDistance,
    location,
    heading 
  } = useProximity();

  const [mapRegion, setMapRegion] = useState({
    latitude: 48.8566,  // Paris par défaut
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Centrer sur position utilisateur
  useEffect(() => {
    if (location) {
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [location]);

  // Démarrer scan au montage
  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  const getAlertColor = () => {
    if (closestDistance < 100) return '#FF0000';  // < 1m
    if (closestDistance < 300) return '#FF8C00';  // < 3m
    if (closestDistance < 500) return '#FFD700';  // < 5m
    return '#00FF00';
  };

  const getStatusText = () => {
    if (closestDistance < 100) return 'DANGER COLLISION';
    if (closestDistance < 300) return 'ALERTE PROXIMITÉ';
    if (closestDistance < 500) return 'ATTENTION';
    return 'ZONE SÛRE';
  };

  return (
    <View style={styles.container}>
      {/* Header avec info distance */}
      <View style={styles.header}>
        <Text style={styles.title}>TCAS-5M RADAR</Text>
        <View style={[styles.alertBox, { backgroundColor: getAlertColor() + '20' }]}>
          <Text style={[styles.distanceText, { color: getAlertColor() }]}>
            {closestDistance < 999 ? `${closestDistance} cm` : '---'}
          </Text>
          <Text style={[styles.statusText, { color: getAlertColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        <Text style={styles.deviceCount}>
          {nearbyDevices.length} appareil(s) détecté(s)
        </Text>
      </View>

      {/* Carte Google Maps */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        rotateEnabled={true}
        followsUserLocation={isScanning}
      >
        {/* Cercle de portée 5m autour de l'utilisateur */}
        {location && (
          <>
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={5}  // 5 mètres
              strokeColor={getAlertColor()}
              fillColor={getAlertColor() + '20'}
              strokeWidth={2}
            />
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={3}  // 3 mètres
              strokeColor={closestDistance < 300 ? '#FF8C00' : 'transparent'}
              fillColor={closestDistance < 300 ? '#FF8C0020' : 'transparent'}
              strokeWidth={2}
            />
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={1}  // 1 mètre
              strokeColor={closestDistance < 100 ? '#FF0000' : 'transparent'}
              fillColor={closestDistance < 100 ? '#FF000020' : 'transparent'}
              strokeWidth={2}
            />
          </>
        )}

        {/* Marqueurs des appareils détectés */}
        {location && nearbyDevices.map((device, index) => {
          // Calculer position approximative (très imprécis, juste pour visualisation)
          const angle = (index * 45) * (Math.PI / 180);  // Répartition circulaire
          const offset = device.distance / 100000;  // Conversion cm → degrés approx
          
          return (
            <Marker
              key={device.id}
              coordinate={{
                latitude: location.coords.latitude + Math.sin(angle) * offset,
                longitude: location.coords.longitude + Math.cos(angle) * offset,
              }}
              title={device.name ?? 'Appareil inconnu'}
              description={`${device.distance} cm - ${device.type}`}
            >
              <View style={[styles.deviceMarker, { 
                backgroundColor: device.distance < 100 ? '#FF0000' : 
                                device.distance < 300 ? '#FF8C00' : '#FFD700'
              }]}>
                <MaterialIcons 
                  name={device.type === 'WATCH' ? 'watch' : 
                        device.type === 'PHONE' ? 'smartphone' : 
                        device.type === 'HEADPHONE' ? 'headset' : 'bluetooth'} 
                  size={16} 
                  color="#FFF" 
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Bouton Scan */}
      <TouchableOpacity 
        style={[styles.scanButton, isScanning && styles.scanningButton]}
        onPress={isScanning ? stopScanning : startScanning}
      >
        <MaterialIcons 
          name={isScanning ? 'stop' : 'radar'} 
          size={32} 
          color="#FFF" 
        />
        <Text style={styles.scanButtonText}>
          {isScanning ? 'ARRÊTER' : 'SCANNER'}
        </Text>
      </TouchableOpacity>

      {/* Liste des appareils */}
      <View style={styles.deviceList}>
        {nearbyDevices.slice(0, 3).map(device => (
          <View key={device.id} style={styles.deviceItem}>
            <MaterialIcons 
              name={device.type === 'WATCH' ? 'watch' : 
                    device.type === 'PHONE' ? 'smartphone' : 'bluetooth'} 
              size={20} 
              color="#00FF00" 
            />
            <Text style={styles.deviceName} numberOfLines={1}>
            {device.name ?? 'Appareil inconnu'}
            </Text>
            <Text style={[
              styles.deviceDistance,
              { color: device.distance < 100 ? '#FF0000' : 
                       device.distance < 300 ? '#FF8C00' : '#00FF00' }
            ]}>
              {device.distance} cm
            </Text>
          </View>
        ))}
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
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#00FF00',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  alertBox: {
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  deviceCount: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  map: {
    flex: 1,
  },
  deviceMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  scanButton: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  scanningButton: {
    backgroundColor: '#FF0000',
    shadowColor: '#FF0000',
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  deviceList: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  deviceName: {
    color: '#FFF',
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  deviceDistance: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});