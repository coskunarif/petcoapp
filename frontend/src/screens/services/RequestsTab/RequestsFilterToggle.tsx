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

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  button: { marginHorizontal: 4 },
});
