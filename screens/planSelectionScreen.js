import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles';
import { lightTheme, darkTheme } from '../theme';
import { fetchWorkouts } from '../api';

const PlanSelectionScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the list of created plans from firebase 
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await fetchWorkouts();
        setPlans(Array.isArray(data) ? data : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setError('Failed to load workout plans');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPlans();
  }, []); // Removed plans from dependency array to prevent infinite loop

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[globalStyles.text, { color: theme.colors.text, marginTop: 10 }]}>
            Loading plans...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
          <Text style={[globalStyles.text, { color: theme.colors.error, marginTop: 10 }]}>
            {error}
          </Text>
        </View>
      ) : (
        <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.scrollContent}>
          {plans && plans.length > 0 ? (
            plans.map((plan, index) => {
              const planName = typeof plan === 'object' ? plan.name || `Plan ${index + 1}` : `Plan ${index + 1}`;
              const planDescription = typeof plan === 'object' && plan.description 
                ? plan.description 
                : 'Custom workout plan';
              
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.planCard}
                  onPress={() => navigation.goBack()}
                >
                  <View style={styles.planIconContainer}>
                    <Ionicons
                      name="dumbbell" 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{planName}</Text>
                    <Text style={styles.planDescription}>{planDescription}</Text>
                  </View>
                  <Ionicons
                    name="chevron-right" 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="playlist-remove" size={60} color={theme.colors.text} opacity={0.5} />
              <Text style={[globalStyles.sectionTitle, { color: theme.colors.text, opacity: 0.7, marginTop: 16 }]}>
                No plans available
              </Text>
              <Text style={[globalStyles.text, { color: theme.colors.text, opacity: 0.5, textAlign: 'center', marginTop: 8 }]}>
                Create your first workout plan to get started
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = {
  headerContainer: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center'
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  scrollContent: {
    padding: 16
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  planIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  planInfo: {
    flex: 1
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  planDescription: {
    fontSize: 14,
    color: 'gray'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20
  }
};


export default PlanSelectionScreen;
