import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import { fetchTodayWorkout, getMockTodayWorkout, getActivePlan } from '../api';
import { globalStyles } from '../styles';
import { lightTheme, darkTheme } from '../theme';

const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      try {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = dayNames[new Date().getDay()];
        const activePlan = await getActivePlan();
        const workoutPlan = activePlan.days.find(day => day.day === currentDayName);
        setTodayWorkout(workoutPlan);
      } catch (error) {
        console.error('Error loading workout:', error);
        setTodayWorkout(getMockTodayWorkout());
      } finally {
        if (todayWorkout !== null) {
          setIsLoading(false);
        }
      }
    };

    loadWorkout();
  }, []);

  useEffect(() => {
    if (todayWorkout !== null) {
      setIsLoading(false);
    }
  }, [todayWorkout]);

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent}>
        <View style={globalStyles.headerContainer}>
          <Text style={[globalStyles.greeting, { color: theme.colors.text }]}>
            Good morning, Alex
          </Text>
          <Text style={[globalStyles.date, { color: theme.colors.text }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        <View style={[globalStyles.statsContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={globalStyles.statItem}>
            <Text style={[globalStyles.statValue, { color: theme.colors.text }]}>3</Text>
            <Text style={[globalStyles.statLabel, { color: theme.colors.text }]}>Workouts this week</Text>
          </View>
          <View style={globalStyles.statDivider} />
          <View style={globalStyles.statItem}>
            <Text style={[globalStyles.statValue, { color: theme.colors.text }]}>75%</Text>
            <Text style={[globalStyles.statLabel, { color: theme.colors.text }]}>Weekly goal</Text>
          </View>
        </View>

        <Text style={[globalStyles.sectionTitle, { color: theme.colors.text }]}>Today's Workout</Text>
        {isLoading ? (
          <Text style={{ color: theme.colors.text }}>Loading your workout...</Text>
        ) : todayWorkout ? (
          todayWorkout.restDay ? (
            <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>Rest Day</Text>
              <Text style={[globalStyles.cardSubtitle, { color: theme.colors.text }]}>Take a break and recover!</Text>
            </View>
          ) : (
            <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground }]}>
              <View style={styles.workoutHeader}>
                <View>
                  <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>{todayWorkout.workout.name}</Text>
                </View>
                <TouchableOpacity
                  style={[globalStyles.buttonPrimary, { backgroundColor: theme.colors.primary }]}
                  onPress={() => console.log('Start workout')}
                >
                  <Text style={globalStyles.buttonTextPrimary}>START</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.exerciseList}>
                {todayWorkout.workout.exercises.map((exercise, index) => (
                  <View key={index} style={[
                    globalStyles.listItem,
                    index < todayWorkout.workout.exercises.length - 1 && globalStyles.listItemDivider
                  ]}>
                    <View>
                      <Text style={[globalStyles.itemTitle, { color: theme.colors.text }]}>{exercise.name}</Text>
                      <Text style={[globalStyles.itemSubtitle, { color: theme.colors.text }]}>
                        {exercise.sets} sets • {exercise.reps} reps • {exercise.rest} rest
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
                  </View>
                ))}
              </View>
            </View>
          )
        ) : (
          <Text style={{ color: theme.colors.text }}>No workout found.</Text>
        )}


        <Text style={[globalStyles.sectionTitle, { color: theme.colors.text }]}>Progress</Text>

        <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>This Month</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarLabels}>
              <Text style={[styles.progressBarText, { color: theme.colors.text }]}>Workouts Completed</Text>
              <Text style={[styles.progressBarText, { color: theme.colors.text }]}>12/15</Text>
            </View>
            <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
              <View style={[styles.progressBarFill, { backgroundColor: theme.colors.success, width: '80%' }]} />
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarLabels}>
              <Text style={[styles.progressBarText, { color: theme.colors.text }]}>Weight Goal</Text>
              <Text style={[styles.progressBarText, { color: theme.colors.text }]}>68/65 kg</Text>
            </View>
            <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
              <View style={[styles.progressBarFill, { backgroundColor: theme.colors.accent, width: '90%' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Component-specific styles
const styles = {
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseList: {
    marginTop: 8,
  },
  progressBarContainer: {
    marginTop: 16,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBarText: {
    fontSize: 14,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
};

export default HomeScreen;
