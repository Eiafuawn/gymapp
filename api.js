import { app } from './firebaseConfig';
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";
import { getAuth } from "firebase/auth";

const database = getDatabase(app);
const auth = getAuth(app);
const user = auth.currentUser ? auth.currentUser.uid : null;


export const handleSaveWorkout = (workout) => {
  if (!user) {
    console.error('No user is signed in. Cannot save workout.');
    return;
  }
  push(ref(database, `user/${user}/workouts/`), workout)
    .then(() => {
      console.log('Workout saved successfully');
    })
    .catch((error) => {
      console.error('Error saving workout:', error);
    });
}

export const handleDeleteWorkout = (workoutId) => {
  const workoutRef = ref(database, `user/${user}/workouts/${workoutId}`);
  remove(workoutRef)
    .then(() => {
      console.log('Workout deleted successfully');
    })
    .catch((error) => {
      console.error('Error deleting workout:', error);
    });
}

export const handleSavePlan = (plan) => {
  push(ref(database, `user/${user}/workoutPlans/`), plan)
    .then(() => {
      console.log('Plan saved successfully');
    })
    .catch((error) => {
      console.error('Error saving plan:', error);
    });
}
export const handleDeletePlan = (planId) => {
  const planRef = ref(database, `user/${user}/workoutPlans/${planId}`);
  remove(planRef)
    .then(() => {
      console.log('Plan deleted successfully');
    })
    .catch((error) => {
      console.error('Error deleting plan:', error);
    });
}

export const activatePlan = async (selectedPlanId) => {
  try {
    const updates = {
      [`user/${user}/activePlanId`]: selectedPlanId,
    };

    await update(ref(database), updates);

    console.log('Successfully updated active plan!');
  } catch (error) {
    console.error('Failed to update active plan:', error);
  }
};

export const getActivePlanId = async () => {
  return new Promise((resolve, reject) => {
    try {
      const itemsRef = ref(database, `user/${user}/activePlanId/`);
      onValue(
        itemsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            resolve(data);
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error('Error fetching active plan:', error);
          reject(error);
        }
      );
    } catch (error) {
      console.error('Error setting up getActivePlan:', error);
      reject(error);
    }
  });
}

export const getActivePlan = async () => {
  const activePlanId = await getActivePlanId();
  console.log('Active plan ID:', activePlanId);
  console.log('User ID:', user);
  return new Promise((resolve, reject) => {
    try {
      const itemsRef = ref(database, `user/${user}/workoutPlans/${activePlanId}`);
      onValue(
        itemsRef,
        (snapshot) => {
          const data = snapshot.val();
          console.log('Active plan data:', data);
          if (data) {
            const workoutPlan = {
              id: activePlanId,
              ...data,
            };
            resolve(workoutPlan);
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.error('Error fetching active plan:', error);
          reject(error);
        }
      );
    } catch (error) {
      console.error('Error setting up getActivePlan:', error);
      reject(error);
    }
  });
}

export const fetchPlans = async () => {
  return new Promise((resolve, reject) => {
    try {
      const itemsRef = ref(database, `user/${user}/workoutPlans/`);
      onValue(
        itemsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const workoutPlans = Object.keys(data).map((key) => {
              const plan = {
                id: key,
                ...data[key],
              };
              return plan;
            });
            resolve(workoutPlans);
          } else {
            resolve([]);
          }
        },
        (error) => {
          console.error('Error fetching plans:', error);
          reject(error);
        }
      );
    } catch (error) {
      console.error('Error setting up fetchPlans:', error);
      reject(error);
    }
  });
};

export const fetchWorkouts = async () => {
  try {
    return new Promise((resolve, reject) => {
      const itemsRef = ref(database, `user/${user}/workouts/`);
      onValue(
        itemsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const workouts = Object.keys(data).map((key) => {
              const workout = {
                id: key,
                ...data[key],
              };
              return workout;
            });
            resolve(workouts);
          } else {
            resolve([]);
          }
        },
        (error) => {
          console.error('Error fetching workouts:', error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error setting up fetchWorkouts:', error);
    throw error;
  }
}


export const fetchTodayWorkout = async () => {
  try {
    const response = await fetch('your-api-url/today-workout');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching today\'s workout:', error);
    return getMockTodayWorkout();
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
      response = await fetch(`https://exercisedb-api.vercel.app/api/v1/exercises?offset=${(page - 1) * 10}&limit=10`);
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

export const fetchExoById = async (id) => {
  try {
    const response = await fetch(`https://exercisedb-api.vercel.app/api/v1/exercises/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercise by ID:', error);
    return null;
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

export const fetchAutocompleteExercises = async (query) => {
  try {
    const response = await fetch(`https://exercisedb-api.vercel.app/api/v1/exercises/autocomplete?search=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching autocomplete exercises:', error);
  }
};

