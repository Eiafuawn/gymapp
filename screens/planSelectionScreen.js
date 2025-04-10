import React from 'react';
import { useColorScheme } from 'react-native';
import { 
  Text,
  SafeAreaView, 
  View 
} from 'react-native';

// Import styles and theme
import { globalStyles } from '../styles';
import { lightTheme, darkTheme } from '../theme';

const PlanSelectionScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[globalStyles.comingSoonText, { color: theme.colors.text }]}>
          Profile Feature Coming Soon
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default PlanSelectionScreen;
