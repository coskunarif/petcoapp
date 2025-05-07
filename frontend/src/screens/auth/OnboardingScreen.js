import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';

export default function OnboardingScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: 'Welcome to PetCoApp!',
      description: 'Your one-stop platform for pet services. Connect with pet care providers or offer your services to fellow pet owners.',
      image: require('../../../assets/logo.png')
    },
    {
      title: 'Find Local Pet Services',
      description: 'Browse nearby pet sitters, dog walkers, groomers, and more. Book with confidence from our trusted provider network.',
      image: require('../../../assets/logo.png')
    },
    {
      title: 'Manage Your Pets',
      description: 'Add your pets to your profile with their details, photos, and care instructions to ensure they get the best care.',
      image: require('../../../assets/logo.png')
    },
    {
      title: 'All Set!',
      description: 'Thank you for joining PetCoApp! We\'ve added 10 credits to your account to get you started.',
      image: require('../../../assets/logo.png')
    }
  ];
  
  const currentStepData = steps[currentStep];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      dispatch(loginSuccess(user));
    }
  };
  
  const handleSkip = () => {
    // Skip onboarding
    dispatch(loginSuccess(user));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        {currentStep < steps.length - 1 && (
          <Button mode="text" onPress={handleSkip}>
            Skip
          </Button>
        )}
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image 
          source={currentStepData.image} 
          style={styles.image} 
          resizeMode="contain"
        />
        
        <Text variant="headlineMedium" style={styles.title}>
          {currentStepData.title}
        </Text>
        
        <Text style={styles.description}>
          {currentStepData.description}
        </Text>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                { backgroundColor: currentStep === index ? '#6C63FF' : '#DDDDDD' }
              ]}
            />
          ))}
        </View>
        
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={handleNext}
        >
          {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 48,
  },
  footer: {
    padding: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  button: {
    paddingVertical: 8,
    backgroundColor: '#6C63FF',
  },
});
