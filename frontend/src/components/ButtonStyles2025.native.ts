import { StyleSheet } from 'react-native';

export const ButtonStyles2025 = StyleSheet.create({
  primary: {
    backgroundColor: 'linear-gradient(90deg, #6C63FF 0%, #48C6EF 100%)', // fallback for RN: use gradient lib in prod
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.2,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
    shadowColor: '#48C6EF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.2,
  },
});

// NOTE: For real gradients, use 'react-native-linear-gradient' and apply styles accordingly.
