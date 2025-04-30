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
import { useTheme } from '../theme';
import { fetchPlans, handleDeletePlan } from '../api';
import { useAuth } from '../auth';

const PlanSelectionScreen = ({ navigation, route, onSelect }) => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme(colorScheme);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const { user } = useAuth();

  const currentPlan = route.params?.onGoBack;

  useEffect(() => {
    const getPlans = async () => {
      try {
        const plans = await fetchPlans(user);
        setPlans(plans);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    }

    setPlans(getPlans());
    setIsLoading(false);
  }, []);

  const handleSelectPlan = (plan) => {
    navigation.goBack();
    route.params?.onSelect(plan);
  };

  const handleCreateNewPlan = () => {
    navigation.navigate('CreatePlan');
  };
  
  const countNbrOfWorkouts = (plan) => {
    return plan.days.filter(day => day.restDay).length;
  }

  const countNbrOfRestDays = (plan) => {
    return plan.days.filter(day => !day.restDay).length;
  }

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

  const deletePlan = async (planId) => {
    try {
      await handleDeletePlan(user, planId);
      setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  }

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
              <Ionicons
                name="barbell"
                size={24}
                color={theme.colors.text}
              />
              <View style={styles.planInfo}>
                <Text style={[styles.planTitle, { color: theme.colors.text }]}>{item.name}</Text>
                <View style={styles.planMeta}>
                  <View style={styles.planMetaItem}>
                    <Ionicons name="fitness-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.planMetaText, { color: theme.colors.textSecondary }]}>
                      {countNbrOfWorkouts(item)} workouts
                    </Text>
                  </View>
                  <View style={styles.planMetaItem}>
                    <Ionicons name="bed-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.planMetaText, { color: theme.colors.textSecondary }]}>
                      {countNbrOfRestDays(item)} rest days
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePlan(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>

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
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default PlanSelectionScreen;

