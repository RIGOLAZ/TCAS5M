// src/navigation/DrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { RadarMapScreen } from '../screens/RadarMapScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TutorialScreen } from '../screens/TutorialScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { CustomDrawer } from '../components/CustomDrawer';


const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#1a1a1a',
            width: 280,
          },
          drawerActiveTintColor: '#00FF00',
          drawerInactiveTintColor: '#888',
        }}
      >
        <Drawer.Screen 
          name="Radar" 
          component={RadarMapScreen}
          options={{ drawerLabel: '🎯 Radar TCAS' }}
        />
        <Drawer.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ drawerLabel: '📜 Historique' }}
        />
        <Drawer.Screen 
          name="Stats" 
          component={StatsScreen}
          options={{ drawerLabel: '📊 Statistiques' }}
        />
        <Drawer.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ drawerLabel: '⚙️ Paramètres' }}
        />
        <Drawer.Screen 
          name="Tutorial" 
          component={TutorialScreen}
          options={{ drawerLabel: '📚 Tutoriel' }}
        />
        <Drawer.Screen 
          name="About" 
          component={AboutScreen}
          options={{ drawerLabel: 'ℹ️ À propos' }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};