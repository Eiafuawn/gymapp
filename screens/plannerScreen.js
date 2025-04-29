import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles } from '../styles';
import { lightTheme, darkTheme } from '../theme';
import { fetchPlans, activatePlan, getActivePlanId } from '../api';

const PlannerScreen = ({ navigation, route }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPlanActive, setIsPlanActive] = useState(false);

  useEffect(() => {
    if (route.params?.selectedPlan) {
      console.log('Route params received:', route.params.selectedPlan);
    }
  }, [route.params]);

  useEffect(() => {
    const loadDefaultPlan = async () => {
      try {
        const plans = await fetchPlans();
        if (plans.length > 0) {
          const defaultPlan = plans[0];
          setPlan(defaultPlan);
          const activePlan = await getActivePlanId();
          if (String(activePlan) === String(plan.id)) {
            setIsPlanActive(true);
          } else {
            setIsPlanActive(false);
          }
        } else {
          console.log('No plans found.');
        }
      } catch (error) {
        console.error('Error loading default plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!route.params?.selectedPlan) {
      loadDefaultPlan();
    }
  }, []);

  useEffect(() => {
    const activePlan = async () => {
      try {
        const activePlan = await getActivePlanId();
        if (String(activePlan) === String(plan.id)) {
          setIsPlanActive(true);
        } else {
          setIsPlanActive(false);
          }
      } catch (error) {
        console.error('Error fetching active plan:', error);
      }
    };
      activePlan();
    }, [plan]);




  const navigateToExerciseScreen = () => {
    navigation.navigate('CreateWorkout', {
      selectedDay: null,
      selectedWeek: activeWeek
    });
  };

  const navigateToPlanSelection = () => {
    navigation.navigate('PlanSelection', {
      onSelect: (selectedPlan) => {
        setPlan(selectedPlan);
      },
    });
  };

const togglePlanActive = async () => {
  if (!plan?.id) return;

  try {
    setIsUpdating(true);

    await activatePlan(plan.id);
    setIsPlanActive((prev) => !prev);

  } catch (error) {
    console.error(error);
  } finally {
    setIsUpdating(false);
  }
};

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
              {plan ? 'Change Plan' : 'Select a Plan'}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>Current Plan</Text>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => togglePlanActive()}
              >
                <Ionicons
                  name={isPlanActive ? "checkbox-outline" : "square-outline"}
                  size={24}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                  {isPlanActive ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[globalStyles.cardSubtitle, { color: theme.colors.text, marginTop: 8 }]}>{plan.name}</Text>

            {plan.category && (
              <View style={styles.planMetaContainer}>
                <View style={styles.planMetaItem}>
                  <Ionicons name="fitness-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.planMetaText, { color: theme.colors.textSecondary }]}>
                    {plan.category}
                  </Text>
                </View>
                {plan.duration && (
                  <View style={styles.planMetaItem}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.planMetaText, { color: theme.colors.textSecondary }]}>
                      {plan.duration}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.daysList}>
              {plan.days.map((day, index) => (
                <TouchableOpacity
                  key={day.day}
                  style={[
                    globalStyles.listItem,
                    index < plan.days.length - 1 && globalStyles.listItemDivider
                  ]}
                  onPress={() => {
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
                      {!day.restDay ? day.workout : 'Rest Day'}
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

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  weekSelector: {
    flexDirection: 'row',
    marginVertical: 16,
    justifyContent: 'space-between',
  },
  weekButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
  daysList: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  planMetaContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 12,
  },
  planMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  planMetaText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default PlannerScreen;
