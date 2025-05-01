import { app } from './firebaseConfig';
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";

const database = getDatabase(app);

export const getUserProfile = (user) => {
  return new Promise((resolve, reject) => {
    try {
      const itemsRef = ref(database, `user/${user.uid}/profile/`);
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
          console.error('Error fetching user profile:', error);
          reject(error);
        });
    } catch (error) {
      console.error('Error setting up getUserProfile:', error);
      reject(error);
    };
  });
}

export const updateUserProfile = (user, profile) => {
  return new Promise((resolve, reject) => {
    try {
      const updates = {
        [`user/${user.uid}/profile/`]: profile,
      };

      update(ref(database), updates)
        .then(() => {
          console.log('Successfully updated user profile!');
          resolve();
        })
        .catch((error) => {
          console.error('Failed to update user profile:', error);
          reject(error);
        });
    } catch (error) {
      console.error('Error setting up updateUserProfile:', error);
      reject(error);
    }
  });
}


export const handleSaveWorkout = (user, workout) => {
  if (!user) {
    console.error('No user is signed in. Cannot save workout.');
    return;
  }
  push(ref(database, `user/${user.uid}/workouts/`), workout)
    .then(() => {
      console.log('Workout saved successfully');
    })
    .catch((error) => {
      console.error('Error saving workout:', error);
    });
}

export const handleUpdateWorkout = (user, workoutId, planId, day, updatedWorkout) => {
  return new Promise((resolve, reject) => {
    try {
      let updates;
      if (workoutId === null) {
        console.log('Workout ID is null, updating only workout plan');
        updates = {
          [`user/${user.uid}/workoutPlans/${planId}/days/${day}`]: updatedWorkout,
        };
      } else {
        updates = {
          [`user/${user.uid}/workouts/${workoutId}`]: updatedWorkout,
          [`user/${user.uid}/workoutPlans/${planId}/days/${day}`]: updatedWorkout,
        };
      }

      update(ref(database), updates)
        .then(() => {
          console.log('Successfully updated workout!');
          resolve();
        })
        .catch((error) => {
          console.error('Failed to update workout:', error);
          reject(error);
        });
    } catch (error) {
      console.error('Error setting up handleUpdateWorkout:', error);
      reject(error);
    }
  });
}

export const handleDeleteWorkout = (user, workoutId) => {
  const workoutRef = ref(database, `user/${user.uid}/workouts/${workoutId}`);
  remove(workoutRef)
    .then(() => {
      console.log('Workout deleted successfully');
    })
    .catch((error) => {
      console.error('Error deleting workout:', error);
    });
}

export const handleSavePlan = (user, plan) => {
  push(ref(database, `user/${user.uid}/workoutPlans/`), plan)
    .then(() => {
      console.log('Plan saved successfully');
    })
    .catch((error) => {
      console.error('Error saving plan:', error);
    });
}
export const handleDeletePlan = (user, planId) => {
  const planRef = ref(database, `user/${user.uid}/workoutPlans/${planId}`);
  remove(planRef)
    .then(() => {
      console.log('Plan deleted successfully');
    })
    .catch((error) => {
      console.error('Error deleting plan:', error);
    });
}

export const activatePlan = async (user, selectedPlanId) => {
  try {
    const updates = {
      [`user/${user.uid}/activePlanId`]: selectedPlanId,
    };

    await update(ref(database), updates);

    console.log('Successfully updated active plan!');
  } catch (error) {
    console.error('Failed to update active plan:', error);
  }
};

export const getActivePlanId = async (user) => {
  return new Promise((resolve, reject) => {
    try {
      const itemsRef = ref(database, `user/${user.uid}/activePlanId/`);
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

export const getActivePlan = async (user) => {
  const activePlanId = await getActivePlanId(user);
  return new Promise((resolve, reject) => {
    try {
      const itemsRef = ref(database, `user/${user.uid}/workoutPlans/${activePlanId}`);
      onValue(
        itemsRef,
        (snapshot) => {
          const data = snapshot.val();
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

export const fetchPlans = async (user) => {
  return new Promise((resolve, reject) => {
    try {
      const itemsRef = ref(database, `user/${user.uid}/workoutPlans/`);
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

export const fetchWorkouts = async (user) => {
  try {
    return new Promise((resolve, reject) => {
      const itemsRef = ref(database, `user/${user.uid}/workouts/`);
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

