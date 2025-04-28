import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setRequestsTabAsProvider } from '../../../redux/slices/serviceSlice';

export default function RequestsFilterToggle() {
  const dispatch = useDispatch();
  const asProvider = useSelector((state: any) => state.services?.requestsTabAsProvider) ?? true;
  return (
    <View style={styles.container}>
      <Button
        mode={asProvider ? 'contained' : 'outlined'}
        style={styles.button}
        onPress={() => dispatch(setRequestsTabAsProvider(true))}
      >
        As Provider
      </Button>
      <Button
        mode={!asProvider ? 'contained' : 'outlined'}
        style={styles.button}
        onPress={() => dispatch(setRequestsTabAsProvider(false))}
      >
        As Requester
      </Button>
    </View>
  );
}

import { Dimensions } from 'react-native';
const isMobile = Dimensions.get('window').width < 600;

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  button: {
    marginHorizontal: 4,
    borderRadius: isMobile ? 24 : 6,
    backgroundColor: isMobile ? 'rgba(255,255,255,0.82)' : undefined,
    borderWidth: isMobile ? 1.5 : 1,
    borderColor: isMobile ? '#b5b3fa' : '#ccc',
    shadowColor: isMobile ? '#6C63FF' : undefined,
    shadowOpacity: isMobile ? 0.09 : 0,
    shadowRadius: isMobile ? 8 : 0,
    elevation: isMobile ? 3 : 1,
    paddingHorizontal: isMobile ? 18 : 8,
    minWidth: isMobile ? 110 : 0,
  },
});
