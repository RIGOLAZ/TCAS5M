// App.tsx
import React from 'react';
import { SettingsProvider } from './src/context/SettingsContext';
import { DrawerNavigator } from './src/navigation/DrawerNavigator';

export default function App() {
  return (
    <SettingsProvider>
      <DrawerNavigator />
    </SettingsProvider>
  );
}