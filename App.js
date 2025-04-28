import React from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/homeScreen';
import PlannerScreen from './screens/plannerScreen';
import ProfileScreen from './screens/profileScreen';
import SettingsScreen from './screens/settingsScreen';
import CreateWorkoutScreen from './screens/createWorkoutScreen';
import PlanSelectionScreen from './screens/planSelectionScreen';
import createPlanScreen from './screens/createPlanScreen';

import { lightTheme, darkTheme } from './theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PlannerStackNavigator = () => {
  const colorScheme = useColorScheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? darkTheme.colors.card : lightTheme.colors.card,
        },
        headerTintColor: colorScheme === 'dark' ? darkTheme.colors.text : lightTheme.colors.text,
      }}
    >
      <Stack.Screen name="PlannerMain" component={PlannerScreen} options={{ title: 'Planner' }} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} options={{ title: 'Create Workout' }} />
      <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} options={{ title: 'Select Plan' }} />
      <Stack.Screen name="CreatePlan" component={createPlanScreen} options={{ title: 'Create Plan' }} />
    </Stack.Navigator>
  );
};

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Planner') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
          headerTitle: route.name === 'Home' ? 'FitTrack' : route.name,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: theme.colors.text,
          },
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Planner" component={PlannerStackNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
