import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/homeScreen';
import PlannerScreen from './screens/plannerScreen';
import ProfileScreen from './screens/profileScreen';
import CreateWorkoutScreen from './screens/createWorkoutScreen';
import PlanSelectionScreen from './screens/planSelectionScreen';
import createPlanScreen from './screens/createPlanScreen';
import SignInScreen from './screens/signInScreen';
import SignUpScreen from './screens/signUpScreen';
import ForgotPasswordScreen from './screens/forgotPasswordScreen';

import { AuthProvider, useAuth } from './auth';
import { ThemeProvider, useTheme } from './theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PlannerStackNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen name="PlannerMain" component={PlannerScreen} options={{ title: 'Planner' }} />
      <Stack.Screen name="CreateWorkout" component={CreateWorkoutScreen} options={{ title: 'Create Workout' }} />
      <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} options={{ title: 'Select Plan' }} />
      <Stack.Screen name="CreatePlan" component={createPlanScreen} options={{ title: 'Create Plan' }} />
    </Stack.Navigator>
  );
};

const SignInStackNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen name="Log In" component={SignInScreen} options={{ title: 'Log In' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { theme, isDarkMode } = useTheme();
  const { user, loading } = useAuth();


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Tab.Navigator
        initialRouteName={user ? 'Home' : 'Log In'}
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
            } else if (route.name === 'Log In') {
              iconName = focused ? 'log-in' : 'log-in-outline';
            } else if (route.name === 'Register') {
              iconName = focused ? 'person-add' : 'person-add-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: isDarkMode ? '#888' : 'gray',
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
        {user ? (
          <>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Planner" component={PlannerStackNavigator} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Tab.Screen name="Log In" component={SignInStackNavigator} options={{ headerShown: false }} />
            <Tab.Screen name="Register" component={SignUpScreen} />
          </>
        )}
      </Tab.Navigator>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
