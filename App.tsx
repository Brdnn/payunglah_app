import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import RootStack from './src/navigations/RootStack';

const App = () => {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
};

export default App;