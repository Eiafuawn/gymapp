import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getMockTodayWorkout, getActivePlan, getUserProfile } from '../api';
import { globalStyles } from '../styles';
import { useAuth } from '../auth';
import { useTheme } from '../theme';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [weeksWorkouts, setWeeksWorkouts] = useState(0);
  const [workoutsDone, setWorkoutsDone] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const { user } = useAuth();

  useFocusEffect(React.useCallback(() => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const getUserProfileData = async () => {
      try {
        const profile = await getUserProfile(user);
        if (profile) {
          setUserProfile(profile);
        } else {
          Alert.alert(
            'Profile Required',
            'Please create a profile first.',
            [{
              text: 'OK', onPress: () => {
                navigation.navigate('ProfileScreen', { mode: 'edit' });
              }
            }],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }

    const loadWorkout = async () => {
      setIsLoading(true);
      try {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = dayNames[new Date().getDay()];
        const currentDayIndex = new Date().getDay();
        const activePlan = await getActivePlan(user);
        const workoutPlan = activePlan.days.find(day => day.day === currentDayName);
        setTodayWorkout(workoutPlan);

        const nbrOfWorkouts = activePlan.days.filter(day => day.restDay === true).length;
        setWeeksWorkouts(nbrOfWorkouts);

        const workoutsBeforeToday = activePlan.days.filter(day => {
          const dayIndex = dayNames.indexOf(day.day);
          return dayIndex >= 0 && dayIndex < currentDayIndex;
        });

        setWorkoutsDone(workoutsBeforeToday.length);
      } catch (error) {
        console.error('Error loading workout:', error);
        setTodayWorkout(getMockTodayWorkout());
      } finally {
        setIsLoading(false);
      }
    };

    getUserProfileData();
    loadWorkout();
  }, [user]));

  const handleWorkoutDone = () => {
    setIsDone(true);
    setWorkoutsDone(prev => prev + 1);
    setWeeksWorkouts(prev => prev + 1);
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent}>
        <View style={globalStyles.headerContainer}>
          <Text style={[globalStyles.greeting, { color: theme.colors.text }]}>
            Hello, {userProfile ? userProfile.name : 'User'}!
          </Text>
          <Text style={[globalStyles.date, { color: theme.colors.text }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        <View style={[globalStyles.statsContainer, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={globalStyles.statItem}>
            <Text style={[globalStyles.statValue, { color: theme.colors.text }]}>{weeksWorkouts}</Text>
            <Text style={[globalStyles.statLabel, { color: theme.colors.text }]}>Workouts this week</Text>
          </View>
          <View style={globalStyles.statDivider} />
          <View style={globalStyles.statItem}>
            <Text style={[globalStyles.statValue, { color: theme.colors.text }]}>{Math.round((workoutsDone / weeksWorkouts) * 100)}%</Text>
            <Text style={[globalStyles.statLabel, { color: theme.colors.text }]}>Weekly goal</Text>
          </View>
        </View>

        <View style={[styles.todaysHeader, { flexDirection: 'row', justifyContent: 'space-between' }]}>
          <Text style={[globalStyles.sectionTitle, { color: theme.colors.text }]}>Today's Workout</Text>

          <TouchableOpacity
            style={[globalStyles.buttonPrimary, { backgroundColor: theme.colors.secondary }]}
            onPress={() => console.log('Add to calendar')}
          >
            <Text style={globalStyles.buttonTextPrimary}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <Text style={{ color: theme.colors.text }}>Loading your workout...</Text>
        ) : todayWorkout ? (
          todayWorkout.restDay || isDone ? (
            <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>Rest Day</Text>
              <Text style={[globalStyles.cardSubtitle, { color: theme.colors.text }]}>Take a break and recover!</Text>
            </View>
          ) : (
            <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground }]}>
              <View style={[styles.workoutHeader, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <Text style={[globalStyles.cardTitle, {
                  color: theme.colors.text,
                  fontSize: 24,
                  paddingVertical: 8,
                  borderRadius: 8,
                }]}>
                  {todayWorkout.workout.name}
                </Text>
                <TouchableOpacity
                  style={[globalStyles.buttonPrimary, { backgroundColor: theme.colors.primary }]}
                  onPress={handleWorkoutDone}
                >
                  <Text style={globalStyles.buttonTextPrimary}>DONE</Text>
                </TouchableOpacity>
              </View>


              <View style={globalStyles.listItemDivider} />
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
  todaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
