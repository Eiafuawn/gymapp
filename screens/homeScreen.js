import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getActivePlan, getUserProfile } from '../api';
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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isDone, setIsDone] = useState(false);
  const { user } = useAuth();

  const handleTimeChange = (event, selectedDate) => {
    if (selectedDate) {
      const now = new Date();
      selectedDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
      setSelectedTime(selectedDate);
    }
  };



  async function getDefaultCalendarSource() {
    if (Platform.OS === 'ios') {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      return defaultCalendar.source;
    } else {
      const calendars = await Calendar.getCalendarsAsync();
      const localCalendar = calendars.find(cal => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER);
      return localCalendar?.source || { isLocalAccount: true, name: 'Expo Calendar' };
    }
  }

  async function getOrCreateFitTrackCalendar() {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const existing = calendars.find(cal => cal.title === 'FitTrack');

    if (existing) {
      return existing.id;
    }

    const source = await getDefaultCalendarSource();

    const newCalendarId = await Calendar.createCalendarAsync({
      title: 'FitTrack',
      color: '#00b894',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: source.id,
      source: source,
      name: 'FitTrack',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    return newCalendarId;
  }

  async function addFitTrackEvent() {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow calendar access to add events.');
      return;
    }

    const calendarId = await getOrCreateFitTrackCalendar();

    const eventDetails = {
      title: 'Workout Session',
      startDate: selectedTime,
      endDate: new Date(selectedTime.getTime() + 60 * 60 * 1000),
      timeZone: 'UTC',
      location: 'Gym',
      notes: 'Workout added from FitTrack',
    };

    try {
      const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
      Alert.alert('Success', 'Workout added to your calendar!');
    } catch (error) {
      Alert.alert('Error', 'Could not create event: ' + error.message);
    }
  }

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
        if (!activePlan) {
          Alert.alert('No active plan found', 'Please create a workout plan first.');
          return;
        }
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

  const handleAddToCalendar = () => {
    setShowTimePicker(false);
    addFitTrackEvent();
    console.log('Workout added to calendar:', selectedTime);
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
            onPress={() => setShowTimePicker(true)}
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

        <Modal visible={showTimePicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Pick a Time</Text>

              <DateTimePicker
                mode="time"
                display="spinner"
                value={selectedTime}
                onChange={handleTimeChange}
                style={styles.datePicker}
              />

              <TouchableOpacity onPress={handleAddToCalendar} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  modalButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
};

export default HomeScreen;
