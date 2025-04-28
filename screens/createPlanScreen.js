import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme } from '../theme';
import { useColorScheme } from 'react-native';
import { fetchWorkouts, handleSavePlan } from '../api';

const CreatePlanScreen = ({ navigation, route }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const [planName, setPlanName] = useState('');
  const [selectedWorkouts, setSelectedWorkouts] = useState({
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
    Sunday: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [workouts, setWorkouts] = useState([]);


  useEffect(() => {
    const getWorkouts = async () => {
      try {
        const workouts = await fetchWorkouts();
        setWorkouts(workouts);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    }
    getWorkouts();
  }, []);


  const handleSelectWorkout = (workout) => {
    setSelectedWorkouts((prev) => ({
      ...prev,
      [selectedDay]: {
        id: workout.id,
        name: workout.name,
      },
    }));
    setModalVisible(false);
  };


  const handleDayPress = (day) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const renderDayItem = ({ item }) => {
    const workout = selectedWorkouts[item];
    return (
      <TouchableOpacity
        style={styles.dayItem}
        onPress={() => handleDayPress(item)}
      >
        <Text style={[styles.dayText, { color: theme.colors.text }]}>{item}</Text>
        <Text style={[styles.workoutText, { color: theme.colors.textSecondary }]}>
          {workout ? workout.name : 'Rest Day'}
        </Text>
      </TouchableOpacity>
    );
  };

  const savePlan = () => {
    console.log('Saving plan:', planName, selectedWorkouts);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = [];

    const completeWorkouts = {};
    daysOfWeek.forEach(day => {
      completeWorkouts[day] = selectedWorkouts[day] || { rest: true };
      days.push({
        day,
        workout: selectedWorkouts[day] ? selectedWorkouts[day].name : 'Rest Day',
        restDay: !selectedWorkouts[day],
      });
    });

    const plan = {
      name: planName,
      days: days,
    };
    console.log('Plan to save:', plan);

    handleSavePlan(plan);
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.createNewPlanButton}
          onPress={savePlan}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme, planName, selectedWorkouts]);

  useEffect(() => {
    navigation.setParams({
      planName,
      onSave: savePlan,
    });
  }, [planName, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        style={[styles.input, { borderColor: theme.colors.primary, color: theme.colors.text }]}
        placeholder="Plan Name"
        placeholderTextColor={theme.colors.textSecondary}
        value={planName}
        onChangeText={setPlanName}
      />

      <FlatList
        data={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
        keyExtractor={(item) => item}
        renderItem={renderDayItem}
        contentContainerStyle={styles.listContainer}
      />
      <Button
        title="Save Plan"
        onPress={savePlan}
        color={theme.colors.primary}
        disabled={!planName}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select a Workout</Text>
            <FlatList
              data={workouts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectWorkout(item)}
                >
                  <Text style={[styles.modalItemText, { color: theme.colors.text }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
  },
  dayItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#f1f3f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 18,
    fontWeight: '500',
  },
  workoutText: {
    fontSize: 14,
    color: '#888',
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalItem: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    marginBottom: 10,
  },
  modalItemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
  },
  createNewPlanButton: {
    marginRight: 16,
  },
});

export default CreatePlanScreen;

