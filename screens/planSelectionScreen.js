import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles';
import { lightTheme, darkTheme } from '../theme';

const PlanSelectionScreen = ({ navigation, route, onSelect }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  const currentPlan = route.params?.onGoBack;

  useEffect(() => {
    const mockPlans = [
      {
        id: '1',
        title: 'Summer Shape-Up',
        category: 'Beginner',
        duration: '4 Weeks',
        image: 'https://via.placeholder.com/150',
        days: [
          { day: "Monday", type: "Upper Body", restDay: false },
          { day: "Tuesday", type: "Lower Body", restDay: false },
          { day: "Wednesday", type: null, restDay: true },
          { day: "Thursday", type: "Full Body", restDay: false },
          { day: "Friday", type: "Core & Cardio", restDay: false },
          { day: "Saturday", type: null, restDay: true },
          { day: "Sunday", type: "Active Recovery", restDay: false }
        ]
      },
      {
        id: '2',
        title: 'Full Body Blast',
        category: 'Intermediate',
        duration: '6 Weeks',
        image: 'https://via.placeholder.com/150',
        days: [
          { day: "Monday", type: "Push", restDay: false },
          { day: "Tuesday", type: "Pull", restDay: false },
          { day: "Wednesday", type: "Legs", restDay: false },
          { day: "Thursday", type: null, restDay: true },
          { day: "Friday", type: "Upper Body", restDay: false },
          { day: "Saturday", type: "Lower Body", restDay: false },
          { day: "Sunday", type: null, restDay: true }
        ]
      },
      {
        id: '3',
        title: 'Strength Builder',
        category: 'Advanced',
        duration: '8 Weeks',
        image: 'https://via.placeholder.com/150',
        days: [
          { day: "Monday", type: "Chest & Triceps", restDay: false },
          { day: "Tuesday", type: "Back & Biceps", restDay: false },
          { day: "Wednesday", type: "Legs & Shoulders", restDay: false },
          { day: "Thursday", type: null, restDay: true },
          { day: "Friday", type: "Upper Power", restDay: false },
          { day: "Saturday", type: "Lower Power", restDay: false },
          { day: "Sunday", type: null, restDay: true }
        ]
      },
      {
        id: '4',
        title: 'Endurance Focus',
        category: 'Intermediate',
        duration: '6 Weeks',
        image: 'https://via.placeholder.com/150',
        days: [
          { day: "Monday", type: "HIIT", restDay: false },
          { day: "Tuesday", type: "Strength", restDay: false },
          { day: "Wednesday", type: "Cardio", restDay: false },
          { day: "Thursday", type: null, restDay: true },
          { day: "Friday", type: "Circuit Training", restDay: false },
          { day: "Saturday", type: "Endurance", restDay: false },
          { day: "Sunday", type: "Active Recovery", restDay: false }
        ]
      },
      {
        id: '5',
        title: 'At-Home Minimal Equipment',
        category: 'Beginner',
        duration: '4 Weeks',
        image: 'https://via.placeholder.com/150',
        days: [
          { day: "Monday", type: "Full Body", restDay: false },
          { day: "Tuesday", type: "Cardio", restDay: false },
          { day: "Wednesday", type: null, restDay: true },
          { day: "Thursday", type: "Full Body", restDay: false },
          { day: "Friday", type: "HIIT", restDay: false },
          { day: "Saturday", type: "Mobility", restDay: false },
          { day: "Sunday", type: null, restDay: true }
        ]
      }
    ];

    setTimeout(() => {
      setPlans(mockPlans);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSelectPlan = (plan) => {
    navigation.goBack();
    route.params?.onSelect(plan);
  };

  const handleCreateNewPlan = () => {
    navigation.navigate('CreatePlan');
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.createNewPlanButton}
          onPress={handleCreateNewPlan}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading plans...</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.planItem,
                currentPlan?.id === item.id && styles.currentPlanItem,
                { backgroundColor: theme.colors.cardBackground }
              ]}
              activeOpacity={0.7}
              onPress={() => handleSelectPlan(item)}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.planImage}
              />
              <View style={styles.planInfo}>
                <Text style={[styles.planTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <View style={styles.planMeta}>
                  <View style={styles.planMetaItem}>
                    <Ionicons name="fitness-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.planMetaText, { color: theme.colors.textSecondary }]}>
                      {item.category}
                    </Text>
                  </View>
                  <View style={styles.planMetaItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.planMetaText, { color: theme.colors.textSecondary }]}>
                      {item.duration}
                    </Text>
                  </View>
                </View>
              </View>

              {currentPlan?.id === item.id && (
                <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  createNewPlanButton: {
    marginRight: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  planImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
  },
  planInfo: {
    flex: 1,
    marginLeft: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default PlanSelectionScreen;

