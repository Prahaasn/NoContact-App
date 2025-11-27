import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

import HomeScreen from '../screens/HomeScreen';
import CheckInScreen from '../screens/CheckInScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import TruthsScreen from '../screens/TruthsScreen';
import JournalScreen from '../screens/JournalScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused, emoji }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
    <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
  </View>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" focused={focused} emoji="🏠" />
          ),
        }}
      />
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Check-In" focused={focused} emoji="📝" />
          ),
        }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Help" focused={focused} emoji="🆘" />
          ),
        }}
      />
      <Tab.Screen
        name="Truths"
        component={TruthsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Truths" focused={focused} emoji="💜" />
          ),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Journal" focused={focused} emoji="📖" />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Progress" focused={focused} emoji="📊" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.surfaceLight,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    opacity: 0.6,
  },
  emojiFocused: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default TabNavigator;
