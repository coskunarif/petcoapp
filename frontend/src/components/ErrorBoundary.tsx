import React from 'react';
import { View, Text } from 'react-native';
import { logEvent } from '../lib/analytics';

export class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    logEvent('error', { error: error?.toString(), info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: 'red', fontSize: 18, marginBottom: 8 }}>Something went wrong.</Text>
          <Text selectable>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
