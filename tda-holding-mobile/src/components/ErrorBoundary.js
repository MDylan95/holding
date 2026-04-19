import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Erreur de rendu</Text>
          <Text style={styles.message}>{this.state.error?.toString()}</Text>
          <Text style={styles.stack}>{this.state.errorInfo?.componentStack}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            <Text style={styles.btnText}>Réessayer</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#DC2626', marginBottom: 12 },
  message: { fontSize: 13, color: '#374151', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 12 },
  stack: { fontSize: 11, color: '#6B7280', fontFamily: 'monospace' },
  btn: { marginTop: 20, backgroundColor: '#1B5E20', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
