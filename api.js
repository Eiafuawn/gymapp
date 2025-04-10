import { app } from './firebaseConfig';
import { getDatabase, ref, push, onValue } from "firebase/database";

const database = getDatabase(app);

export const handleSaveWorkout = (workout) => {
  push(ref(database, 'workouts/'), workout)
    .then(() => {
      console.log('Workout saved successfully');
    })
    .catch((error) => {
      console.error('Error saving workout:', error);
    });
}

export const fetchTodayWorkout = async () => {
  try {
    const response = await fetch('your-api-url/today-workout');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching today\'s workout:', error); return getMockTodayWorkout();
  }
};

export const fetchWorkoutPlan = async () => {
  try {
    const response = await fetch('your-api-url/workout-plan');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching workout plan:', error);
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

export const fetchExo = async (page, search) => {
  try {
    let response;
    if (page && !search) {
      response = await fetch(`https://exercisedb-api.vercel.app/api/v1/exercises?offset=${(page-1) * 10}&limit=10`);
    } else if (search && !page) {
      response = await fetch(`https://exercisedb-api.vercel.app/api/v1/autocomplete?search=${search}`);
    } else if (search && page) {
      response = await fetch(`https://exercisedb-api.vercel.app/api/v1/autocomplete?search=${search}?offset=${page * 10}&limit=10&search=${search}`);
    }
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

export const fetchWorkouts = async () => {
  try {
    const itemsRef = ref(database, 'workouts/');
    let workouts = [];
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      workouts = data ? Object.values(data) : [];
    });
    return workouts;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return getMockWorkoutPlan();
  }
}
