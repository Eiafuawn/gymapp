import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { getUserProfile, updateUserProfile } from '../api';
import { useTheme } from '../theme';
import { useAuth } from '../auth';

const ProfileScreen = ({ navigation, route }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const placeholderProfile = {
    name: 'Alex Johnson',
    age: 28,
    gender: 'Male',
    height: 175, // in cm
    weight: 70, // in kg
    bodyFat: 18, // in percentage
    goal: 'Build muscle',
    activityLevel: 'Moderate',
    profileImage: 'https://reactnative.dev/img/tiny_logo.png', // placeholder
    notifications: true,
    units: 'metric' // metric or imperial
  }

  const [profile, setProfile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({...profile});
  const [isSaving, setIsSaving] = useState(false);
  
  const fitnessGoals = ['Lose weight', 'Build muscle', 'Improve endurance', 'General fitness'];
  const activityLevels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very active'];

  if (route.params?.mode === 'edit') {
    setIsEditing(true);
    toggleEditMode();
  }

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userProfile = await getUserProfile(user);
        if (userProfile) {
          setProfile(userProfile);
          setEditableProfile(userProfile);
        } else {
          setProfile(placeholderProfile);
          setEditableProfile(placeholderProfile);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load profile:', error);
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateUserProfile(user, editableProfile); 
      setProfile(editableProfile);
      setIsEditing(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setIsSaving(false);
      alert('Failed to save profile. Please try again.');
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setEditableProfile({...profile});
    } else {
      setEditableProfile({...profile});
    }
    setIsEditing(!isEditing);
  };

  const getFormattedHeight = () => {
    if (profile.units === 'metric') {
      return `${profile.height} cm`;
    } else {
      const totalInches = profile.height / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
  };

  const getFormattedWeight = () => {
    if (profile.units === 'metric') {
      return `${profile.weight} kg`;
    } else {
      // Convert kg to lbs
      const lbs = Math.round(profile.weight * 2.20462);
      return `${lbs} lbs`;
    }
  };

  const calculateBMI = () => {
    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const calculateCalories = () => {
    let bmr;
    if (profile.gender === 'Male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }
    
    const activityMultipliers = {
      'Sedentary': 1.2,
      'Light': 1.375,
      'Moderate': 1.55,
      'Active': 1.725,
      'Very active': 1.9
    };
    
    const multiplier = activityMultipliers[profile.activityLevel] || 1.55;
    return Math.round(bmr * multiplier);
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with profile image and username */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: profile.profileImage }}
              style={styles.profileImage}
            />
            {isEditing && (
              <TouchableOpacity style={styles.editImageButton}>
                <Text style={styles.editImageText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.nameContainer}>
            {isEditing ? (
              <TextInput
                value={editableProfile.name}
                onChangeText={(text) => setEditableProfile({...editableProfile, name: text})}
                style={styles.nameInput}
                placeholder="Your Name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            ) : (
              <Text style={styles.userName}>{profile.name}</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={toggleEditMode}
            disabled={isSaving}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Key metrics summary */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{getFormattedWeight()}</Text>
            <Text style={styles.metricLabel}>Weight</Text>
          </View>
          
          <View style={styles.metricDivider} />
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{getFormattedHeight()}</Text>
            <Text style={styles.metricLabel}>Height</Text>
          </View>
          
          <View style={styles.metricDivider} />
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{calculateBMI()}</Text>
            <Text style={styles.metricLabel}>BMI</Text>
          </View>
        </View>
        
        {/* Fitness Goals */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Fitness Goal</Text>
          {isEditing ? (
            <View style={styles.goalOptionsContainer}>
              {fitnessGoals.map((goal, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.goalOption,
                    editableProfile.goal === goal && styles.selectedGoalOption
                  ]}
                  onPress={() => setEditableProfile({...editableProfile, goal: goal})}
                >
                  <Text style={[
                    styles.goalOptionText,
                    editableProfile.goal === goal && styles.selectedGoalOptionText
                  ]}>
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.goalContainer}>
              <Text style={styles.goalText}>{profile.goal}</Text>
            </View>
          )}
        </View>
        
        {/* Profile Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <View style={styles.detailsContainer}>
            {/* Age */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Age</Text>
              {isEditing ? (
                <TextInput
                  value={String(editableProfile.age)}
                  onChangeText={(text) => setEditableProfile({...editableProfile, age: parseInt(text) || 0})}
                  style={styles.detailInput}
                  keyboardType="numeric"
                  maxLength={3}
                />
              ) : (
                <Text style={styles.detailValue}>{profile.age} years</Text>
              )}
            </View>
            
            {/* Gender */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gender</Text>
              {isEditing ? (
                <View style={styles.inlineOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.genderOption,
                      editableProfile.gender === 'Male' && styles.selectedGenderOption
                    ]}
                    onPress={() => setEditableProfile({...editableProfile, gender: 'Male'})}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      editableProfile.gender === 'Male' && styles.selectedGenderOptionText
                    ]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.genderOption,
                      editableProfile.gender === 'Female' && styles.selectedGenderOption
                    ]}
                    onPress={() => setEditableProfile({...editableProfile, gender: 'Female'})}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      editableProfile.gender === 'Female' && styles.selectedGenderOptionText
                    ]}>Female</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.genderOption,
                      editableProfile.gender === 'Other' && styles.selectedGenderOption
                    ]}
                    onPress={() => setEditableProfile({...editableProfile, gender: 'Other'})}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      editableProfile.gender === 'Other' && styles.selectedGenderOptionText
                    ]}>Other</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.detailValue}>{profile.gender}</Text>
              )}
            </View>
            
            {/* Height */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Height</Text>
              {isEditing ? (
                <View style={styles.detailInputContainer}>
                  <TextInput
                    value={String(editableProfile.height)}
                    onChangeText={(text) => setEditableProfile({...editableProfile, height: parseInt(text) || 0})}
                    style={styles.detailInput}
                    keyboardType="numeric"
                  />
                  <Text style={styles.detailInputUnit}>cm</Text>
                </View>
              ) : (
                <Text style={styles.detailValue}>{getFormattedHeight()}</Text>
              )}
            </View>
            
            {/* Weight */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight</Text>
              {isEditing ? (
                <View style={styles.detailInputContainer}>
                  <TextInput
                    value={String(editableProfile.weight)}
                    onChangeText={(text) => setEditableProfile({...editableProfile, weight: parseFloat(text) || 0})}
                    style={styles.detailInput}
                    keyboardType="numeric"
                  />
                  <Text style={styles.detailInputUnit}>kg</Text>
                </View>
              ) : (
                <Text style={styles.detailValue}>{getFormattedWeight()}</Text>
              )}
            </View>
            
            {/* Body Fat */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Body Fat</Text>
              {isEditing ? (
                <View style={styles.detailInputContainer}>
                  <TextInput
                    value={String(editableProfile.bodyFat)}
                    onChangeText={(text) => setEditableProfile({...editableProfile, bodyFat: parseFloat(text) || 0})}
                    style={styles.detailInput}
                    keyboardType="numeric"
                  />
                  <Text style={styles.detailInputUnit}>%</Text>
                </View>
              ) : (
                <Text style={styles.detailValue}>{profile.bodyFat}%</Text>
              )}
            </View>
            
            {/* Activity Level */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Activity Level</Text>
              {isEditing ? (
                <View style={styles.selectorContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {activityLevels.map((level, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={[
                          styles.activityOption,
                          editableProfile.activityLevel === level && styles.selectedActivityOption
                        ]}
                        onPress={() => setEditableProfile({...editableProfile, activityLevel: level})}
                      >
                        <Text style={[
                          styles.activityOptionText,
                          editableProfile.activityLevel === level && styles.selectedActivityOptionText
                        ]}>
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <Text style={styles.detailValue}>{profile.activityLevel}</Text>
              )}
            </View>
            
            {/* Daily Calories */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Est. Daily Calories</Text>
              <Text style={styles.detailValue}>{calculateCalories()} kcal</Text>
            </View>
            
            {/* Settings - Units */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Use Imperial Units</Text>
              {isEditing ? (
                <Switch
                  value={editableProfile.units === 'imperial'}
                  onValueChange={(value) => 
                    setEditableProfile({...editableProfile, units: value ? 'imperial' : 'metric'})
                  }
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              ) : (
                <Text style={styles.detailValue}>{profile.units === 'imperial' ? 'Yes' : 'No'}</Text>
              )}
            </View>
            
            {/* Settings - Notifications */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notifications</Text>
              {isEditing ? (
                <Switch
                  value={editableProfile.notifications}
                  onValueChange={(value) => 
                    setEditableProfile({...editableProfile, notifications: value})
                  }
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              ) : (
                <Text style={styles.detailValue}>{profile.notifications ? 'Enabled' : 'Disabled'}</Text>
              )}
            </View>
            
            {/* Dark Mode Toggle */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>
        </View>
        
        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editImageText: {
    color: theme.colors.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
  nameContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingBottom: 4,
    minWidth: 200,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.cardSecondary,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    marginHorizontal: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  metricDivider: {
    width: 1,
    height: '80%',
    backgroundColor: theme.colors.border,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  goalContainer: {
    backgroundColor: theme.colors.cardSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  goalText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  goalOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalOption: {
    backgroundColor: theme.colors.cardSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  selectedGoalOption: {
    backgroundColor: theme.colors.primary,
  },
  goalOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectedGoalOptionText: {
    color: theme.colors.buttonText,
  },
  detailsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  detailInput: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingVertical: 4,
    minWidth: 60,
    textAlign: 'right',
  },
  detailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailInputUnit: {
    marginLeft: 4,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  inlineOptions: {
    flexDirection: 'row',
  },
  genderOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.cardSecondary,
    marginLeft: 8,
  },
  selectedGenderOption: {
    backgroundColor: theme.colors.primary,
  },
  genderOptionText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  selectedGenderOptionText: {
    color: theme.colors.buttonText,
  },
  selectorContainer: {
    maxWidth: '70%',
  },
  activityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.cardSecondary,
    marginRight: 8,
  },
  selectedActivityOption: {
    backgroundColor: theme.colors.primary,
  },
  activityOptionText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  selectedActivityOptionText: {
    color: theme.colors.buttonText,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "red",
  },
  logoutButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
