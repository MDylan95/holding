import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();

  const requireAuth = useCallback(
    (callback) => {
      if (isAuthenticated) {
        callback();
      } else {
        navigation.navigate('AuthModal', { screen: 'Login' });
      }
    },
    [isAuthenticated, navigation]
  );

  return { isAuthenticated, requireAuth };
}
