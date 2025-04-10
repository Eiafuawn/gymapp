import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles } from '../styles';
import { lightTheme, darkTheme } from '../theme';

const PlannerScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const mockPlan = {
      title: "Summer Shape-Up",
      days: [
        { day: "Monday", type: "Upper Body", restDay: false },
        { day: "Tuesday", type: "Lower Body", restDay: false },
        { day: "Wednesday", type: null, restDay: true },
        { day: "Thursday", type: "Full Body", restDay: false },
        { day: "Friday", type: "Core & Cardio", restDay: false },
        { day: "Saturday", type: null, restDay: true },
        { day: "Sunday", type: "Active Recovery", restDay: false }
      ]
    };

    setTimeout(() => {
      if (selectedPlan) {
        setPlan(selectedPlan);
        console.log('Selected plan:', selectedPlan);
      } else {
        setPlan(mockPlan);
        console.log('Default plan:', mockPlan);
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  const navigateToExerciseScreen = () => {
    navigation.navigate('CreateWorkout', {
      selectedDay: null,
      selectedWeek: activeWeek
    });
  };

  const navigateToPlanSelection = () => {
    navigation.navigate('PlanSelection', {
      onGoBack: selectedPlan,
    })
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent}>
        <Text style={[globalStyles.sectionTitle, { color: theme.colors.text }]}>Workout Planner</Text>

        <TouchableOpacity
          style={[
            globalStyles.button,
            {
              backgroundColor: theme.colors.primary,
              marginBottom: 16,
              paddingVertical: 14,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }
          ]}
          onPress={navigateToPlanSelection}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="list-circle-outline" size={20} color="white" style={styles.buttonIcon} />
            <Text style={[globalStyles.buttonText, { color: 'white', fontSize: 16, fontWeight: '600' }]}>
              Select a Plan
            </Text>
          </View>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading your plan...</Text>
          </View>
        ) : (
          <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>Current Plan</Text>
            <Text style={[globalStyles.cardSubtitle, { color: theme.colors.text }]}>{plan.title}</Text>

            <View style={styles.weekSelector}>
              {[1, 2, 3, 4].map(week => (
                <TouchableOpacity
                  key={week}
                  style={[
                    styles.weekButton,
                    week === activeWeek ?
                      [styles.weekButtonActive, { backgroundColor: theme.colors.primary }] :
                      { borderColor: theme.colors.border }
                  ]}
                  onPress={() => setActiveWeek(week)}
                >
                  <Text
                    style={[
                      styles.weekButtonText,
                      week === activeWeek ?
                        styles.weekButtonTextActive :
                        { color: theme.colors.text }
                    ]}
                  >
                    Week {week}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.daysList}>
              {plan.days.map((day, index) => (
                <TouchableOpacity
                  key={day.day}
                  style={[
                    globalStyles.listItem,
                    index < plan.days.length - 1 && globalStyles.listItemDivider
                  ]}
                  onPress={() => {
                    // Navigate to exercise selection with this specific day
                    navigation.navigate('CreateWorkout', {
                      selectedDay: day.day,
                      selectedWeek: activeWeek
                    });
                  }}
                >
                  <View>
                    <Text style={[globalStyles.itemTitle, { color: theme.colors.text }]}>{day.day}</Text>
                    <Text style={[
                      globalStyles.itemSubtitle,
                      { color: !day.restDay ? theme.colors.text : theme.colors.border }
                    ]}>
                      {!day.restDay ? day.type : 'Rest Day'}
                    </Text>
                  </View>
                  <Ionicons
                    name={!day.restDay ? "barbell-outline" : "bed-outline"}
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  globalStyles.buttonOutline,
                  styles.editButton,
                  {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => console.log('Edit plan')}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="create-outline" size={18} color={theme.colors.primary} style={styles.buttonIcon} />
                  <Text style={[globalStyles.buttonTextOutline, { color: theme.colors.primary, fontWeight: '600' }]}>
                    Edit Plan
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground, marginTop: 24, padding: 20 }]}>
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="fitness-outline"
              size={48}
              color={theme.colors.primary}
              style={styles.emptyStateIcon}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              Ready to create a new workout?
            </Text>
            <Text style={[styles.emptyStateDescription, { color: theme.colors.textSecondary }]}>
              Tap the "Create Workout" button to choose exercises and design your custom workout.
            </Text>
            <TouchableOpacity
              style={[
                globalStyles.button,
                {
                  backgroundColor: theme.colors.primary,
                  marginTop: 20,
                  paddingVertical: 14,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 3,
                }
              ]}
              onPress={navigateToExerciseScreen}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="add-circle-outline" size={20} color="white" style={styles.buttonIcon} />
                <Text style={[globalStyles.buttonText, { color: 'white', fontSize: 16, fontWeight: '600' }]}>
                  Create Workout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Component-specific styles
const styles = {
  weekSelector: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  weekButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weekButtonActive: {
    borderWidth: 0,
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  weekButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  createButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  }
};

export default PlannerScreen;
