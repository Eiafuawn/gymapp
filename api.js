// api.js - API service for workouts
export const fetchTodayWorkout = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('your-api-url/today-workout');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching today\'s workout:', error);
    // Return mock data as fallback
    return getMockTodayWorkout();
  }
};

export const fetchWorkoutPlan = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('your-api-url/workout-plan');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    // Return mock data as fallback
    return getMockWorkoutPlan();
  }
};

export const searchWorkouts = async (query, category = 'all') => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`your-api-url/workouts?query=${query}&category=${category}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching workouts:', error);
    return [];
  }
};

// Mock data for development and testing
export const getMockTodayWorkout = () => {
  return {
    title: "Full Body Strength",
    duration: "45 min",
    exercises: [
      { name: "Squats", sets: 3, reps: 12, rest: "60 sec" },
      { name: "Push-ups", sets: 3, reps: 15, rest: "60 sec" },
      { name: "Deadlifts", sets: 3, reps: 10, rest: "90 sec" },
      { name: "Shoulder Press", sets: 3, reps: 12, rest: "60 sec" },
      { name: "Lunges", sets: 3, reps: 10, rest: "60 sec" }
    ]
  };
};

export const getMockWorkoutPlan = () => {
  return {
    title: "4-week strength training",
    currentWeek: 1,
    days: [
      { day: "Monday", type: "Upper Body", restDay: false },
      { day: "Tuesday", type: "Lower Body", restDay: false },
      { day: "Wednesday", type: null, restDay: true },
      { day: "Thursday", type: "Upper Body", restDay: false },
      { day: "Friday", type: "Lower Body", restDay: false }
    ]
  };
};

export const fetchExo = async () => {
  try {
    const response = await fetch('https://exercisedb-api.vercel.app/api/v1/exercises');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
}

export const fetchExoPerBodyPart = async (bodypartName) => {
  try {
    const response = await fetch(`https://exercisedb-api.vercel.app/api/v1/bodyparts/${bodypartName}/exercises`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercises by body part:', error);
    return [];
  }
}

export const fetchBodyParts = async () => {
  try {
    const response = await fetch('https://exercisedb-api.vercel.app/api/v1/bodyparts');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching body parts:', error);
    return [];
  }
}
