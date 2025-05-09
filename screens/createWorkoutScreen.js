import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles } from '../styles';
import {
  fetchBodyParts,
  fetchExo,
  fetchExoPerBodyPart,
  fetchAutocompleteExercises,
  fetchExoById,
  handleUpdateWorkout,
  fetchWorkouts
} from '../api';
import Pagination from '../components/paginationComponent';
import { handleSaveWorkout } from '../api';
import { useAuth } from '../auth';
import { useTheme } from '../theme';

const CreateWorkoutScreen = ({ route, navigation }) => {
  const { planId, selectedWorkout, selectedDay } = route.params || {};
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const exerciseListRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (planId && selectedWorkout) {
      setWorkoutName(selectedWorkout.name);
      setSelectedExercises(selectedWorkout.exercises);
      setIsUpdating(true);
    } else if (planId) {
      setWorkoutName('New Workout');
      setIsUpdating(true);
    } else {
      setWorkoutName('New Workout');
      setIsUpdating(false);
    }
  }, [planId, selectedWorkout]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchBodyParts();
        const fetchedCategories = data.data.map(item => item.name);
        fetchedCategories.unshift('All');
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoadingExercises(true);
      try {
        const response = activeCategory === 'All'
          ? await fetchExo(currentPage, searchQuery)
          : await fetchExoPerBodyPart(activeCategory, currentPage, searchQuery);

        setExercises(response.data.exercises);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoadingExercises(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchExercises();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [activeCategory, currentPage, searchQuery]);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      if (exerciseListRef.current) {
        exerciseListRef.current.scrollTo({ y: 0, animated: true });
      }
    }
  };

  const handleToggleExercise = (exercise) => {
    setSelectedExercises(prevExercises => {
      const exists = prevExercises.find(e => e.exerciseId === exercise.exerciseId);
      if (exists) {
        return prevExercises.filter(e => e.exerciseId !== exercise.exerciseId);
      } else {
        return [...prevExercises, { ...exercise, sets: '', reps: '', restTime: '' }];
      }
    });
  };

  const updateExerciseField = (index, field, value) => {
    setSelectedExercises(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };


  const saveWorkout = async () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNbr = dayNames.indexOf(selectedDay) - 1;
    const workoutId = selectedWorkout ? selectedWorkout.id : null;
    if (isUpdating && workoutId !== null) {
      handleUpdateWorkout(user, workoutId, planId, dayNbr, {
        name: workoutName,
        workout: selectedExercises,
        day: selectedDay,
      });
    } else if (isUpdating && workoutId === null) {
      const newWorkout = {
        name: workoutName,
        exercises: selectedExercises,
      }
      handleSaveWorkout(user, newWorkout);
      const workouts = await fetchWorkouts(user);
      const newWorkoutFetched = workouts.find(workout => workout.name === workoutName);
      const newDay = {
        day: selectedDay,
        workout: newWorkoutFetched,
        restDay: false,
      }
      handleUpdateWorkout(user, workoutId, planId, dayNbr, newDay);

    } else if (!isUpdating) {
      handleSaveWorkout(user, {
        name: workoutName,
        exercises: selectedExercises,
      });
    }

    navigation.goBack();
  };

  const isExerciseSelected = (exercise) => {
    return selectedExercises.some(e => e.exerciseId === exercise.exerciseId);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) return;
    if (!query.trim()) {
      setExercises([]);
      return;
    }
    const response = await fetchAutocompleteExercises(query);
    const detailedExercises = await Promise.all(
      response.data.map(item => fetchExoById(item.exerciseId))
    );
    const exercisesArray = detailedExercises.map(item => item.data);
    setExercises(exercisesArray);
    setTotalPages(1);
  };


  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={globalStyles.scrollContent}>
        <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>Workout Details</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Workout Name</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }
              ]}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Enter workout name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>


          <View style={styles.selectedCountContainer}>
            <Text style={[styles.selectedCountText, { color: theme.colors.text }]}>
              {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        </View>

        <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground, marginTop: 16 }]}>
          <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>Select Exercises</Text>

          <View style={[
            styles.searchContainer,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border
            }
          ]}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search exercises..."
              placeholderTextColor={theme.colors.textSecondary}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => handleSearch()}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  category === activeCategory ?
                    [styles.categoryButtonActive, { backgroundColor: theme.colors.primary }] :
                    { borderColor: theme.colors.border }
                ]}
                onPress={() => {
                  setActiveCategory(category);
                  setCurrentPage(1);
                }}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === activeCategory ?
                      styles.categoryButtonTextActive :
                      { color: theme.colors.text }
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView ref={exerciseListRef} style={styles.exercisesList}>
            {loadingExercises ? (
              <View style={styles.loadingExercises}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text, marginTop: 8 }]}>
                  Loading exercises...
                </Text>
              </View>
            ) : exercises.length > 0 ? (
              exercises.map((exercise) => {
                const isSelected = isExerciseSelected(exercise);
                return (
                  <TouchableOpacity
                    key={`exercise-${exercise.exerciseId || Math.random().toString(36).substring(7)}`}
                    style={[
                      globalStyles.listItem,
                      isSelected && styles.selectedExercise
                    ]}
                    onPress={() => handleToggleExercise(exercise)}
                  >
                    <View style={styles.exerciseInfo}>
                      <Text style={[globalStyles.itemTitle, { color: theme.colors.text }]}>{exercise.name}</Text>
                      <Text style={[globalStyles.itemSubtitle, { color: theme.colors.text }]}>
                        {exercise.bodyParts?.join(', ') || 'No body part'}
                      </Text>
                      <Text style={[globalStyles.itemSubtitle, { color: theme.colors.textSecondary }]}>
                        {exercise.equipments?.join(', ') || 'No equipment'}
                      </Text>
                    </View>
                    <View style={styles.checkboxContainer}>
                      <View style={[
                        styles.checkbox,
                        isSelected ?
                          { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } :
                          { borderColor: theme.colors.border }
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={[styles.noExercises, { color: theme.colors.text }]}>
                No exercises found for this category
              </Text>
            )}
          </ScrollView>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            theme={theme}
          />
        </View>

        {selectedExercises.length > 0 && (
          <View style={[globalStyles.card, { backgroundColor: theme.colors.cardBackground, marginTop: 16 }]}>
            <Text style={[globalStyles.cardTitle, { color: theme.colors.text }]}>Selected Exercises</Text>

            <View style={styles.selectedExercisesList}>
              {selectedExercises.map((exercise, index) => (
                <View
                  key={`selected-${exercise.exerciseId || index}`}
                  style={[
                    styles.selectedExerciseItem,
                    index < selectedExercises.length - 1 && styles.selectedExercisesDivider
                  ]}
                >
                  <View style={styles.selectedExerciseInfo}>
                    <Text style={[styles.selectedExerciseName, { color: theme.colors.text }]}>
                      {index + 1}. {exercise.name}
                    </Text>
                    <Text style={[globalStyles.itemSubtitle, { color: theme.colors.text }]}>
                      {exercise.bodyParts?.join(', ') || 'No body part'}
                    </Text>
                    <Text style={[globalStyles.itemSubtitle, { color: theme.colors.secondaryText }]}>
                      {exercise.equipments?.join(', ') || 'No equipment'}
                    </Text>

                    {/* Add these input fields */}
                    <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                      {['Sets', 'Reps', 'Rest (s)'].map((label, i) => (
                        <View key={label} style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{label}</Text>
                          <TextInput
                            keyboardType="numeric"
                            value={
                              i === 0 ? exercise.sets :
                                i === 1 ? exercise.reps :
                                  exercise.restTime
                            }
                            onChangeText={(text) =>
                              updateExerciseField(index, i === 0 ? 'sets' : i === 1 ? 'reps' : 'restTime', text)
                            }
                            style={{
                              height: 36,
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              color: theme.colors.text,
                              backgroundColor: theme.colors.inputBackground
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleToggleExercise(exercise)}
                  >
                    <Ionicons name="close-circle" size={22} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

          </View>
        )}
        <TouchableOpacity
          style={[
            globalStyles.button,
            {
              alignItems: 'center',
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
          onPress={saveWorkout}
          disabled={selectedExercises.length === 0}
        >
          <View style={styles.buttonContent}>
            <Text style={[globalStyles.buttonText, { color: 'white', fontSize: 16, fontWeight: '600' }]}>
              Save Workout ({selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''})
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40, // Same width as back button for alignment
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  selectedDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDayText: {
    marginLeft: 8,
    fontSize: 14,
  },
  selectedCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryButtonActive: {
    borderWidth: 0,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  exercisesList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  loadingExercises: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  noExercises: {
    padding: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  exerciseInfo: {
    flex: 1,
  },
  checkboxContainer: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedExercise: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedExercisesList: {
    marginTop: 8,
  },
  selectedExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  selectedExercisesDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  selectedExerciseInfo: {
    flex: 1,
  },
  selectedExerciseName: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectedExerciseDetails: {
    fontSize: 13,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 24,
  }
};

export default CreateWorkoutScreen;
