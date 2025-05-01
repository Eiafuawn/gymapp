# 💪 FitTrack – Gym Workout Planner

**FitTrack** is a mobile fitness app built with React Native and Expo. It helps users manage personalized workout plans, track daily progress, and integrate sessions with their device's calendar.

---

## 📱 Features

- Personalized weekly workout plans
- Daily workout tracking with rest day support
- Calendar integration via `expo-calendar`
- User profile management
- Dark/light theme support
- Modular design with reusable components

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Eiafuawn/gymapp.git
   cd gymapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npx expo start
   ```

4. Scan the QR code with the Expo Go app on your device or use an emulator.

---

## 🗂️ Project Structure

- `App.js` – Entry point of the application
- `api.js` – API utilities for fetching user data and plans
- `auth.js` – Authentication context and logic
- `components/` – Reusable UI components
- `screens/` – Main app screens (Home, Profile, etc.)
- `styles.js` – Global styling definitions
- `theme.js` – Theme configuration for light/dark modes
- `assets/` – Images and other static assets

---

## 🔧 Key Dependencies

- `expo`
- `expo-calendar`
- `@react-navigation/native`
- `react-native`
- `react-native-gesture-handler`
- `react-native-modal`
- `@expo/vector-icons`

---

## 📅 Calendar Integration

The app uses `expo-calendar` to add workout sessions to the user's device calendar.

### Permissions

On first use, the app requests calendar access permissions.

### Creating the FitTrack Calendar

If a "FitTrack" calendar doesn't exist, the app creates one automatically.

### Adding Events

Users can add today's workout to their calendar by tapping the "Add to Calendar" button.

---

## 🧪 Development Notes

- Ensure calendar permissions are granted for full functionality.
- The app uses mock data for workouts; integrate with a backend for dynamic content.
- Customize themes and styles in `theme.js` and `styles.js`.

---

## 📸 Screenshots

*Include screenshots of the app here.*

---

## 📄 License

*Specify the license here (e.g., MIT, GPL).*

---

## 🙌 Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
```

To use this:

1. Open your preferred text editor or IDE.
2. Create a new file named `README.md` in the root directory of your project.
3. Paste the above content into the file.
4. Save the file.

You can customize the placeholders like screenshots and license information as per your project's specifics. 
