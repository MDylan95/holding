import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirm dialog.
 * On web, Alert.alert button callbacks don't work — use window.confirm instead.
 */
export function confirmAlert(title, message, onConfirm, onCancel) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm?.();
    } else {
      onCancel?.();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Non', style: 'cancel', onPress: onCancel },
      { text: 'Oui', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

/**
 * Cross-platform success/info alert with optional callback.
 */
export function showAlert(title, message, onDismiss) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    onDismiss?.();
  } else {
    Alert.alert(title, message, [
      { text: 'OK', onPress: onDismiss },
    ]);
  }
}
