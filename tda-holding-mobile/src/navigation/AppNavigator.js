import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import CustomTabBar from '../components/CustomTabBar';
import storage from '../utils/storage';
import { COLORS } from '../constants/theme';

// Onboarding
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';

// Auth screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main screens
import HomeScreen from '../screens/Home/HomeScreen';
import CatalogueScreen from '../screens/Catalogue/CatalogueScreen';
import VehicleDetailScreen from '../screens/Vehicles/VehicleDetailScreen';
import PropertyDetailScreen from '../screens/Properties/PropertyDetailScreen';
import BookingScreen from '../screens/Booking/BookingScreen';
import BookingsListScreen from '../screens/Bookings/BookingsListScreen';
import BookingDetailScreen from '../screens/Bookings/BookingDetailScreen';
import DriverDetailScreen from '../screens/Drivers/DriverDetailScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import AppointmentFormScreen from '../screens/Appointments/AppointmentFormScreen';
import AppointmentDetailScreen from '../screens/Appointments/AppointmentDetailScreen';
import AppointmentsScreen from '../screens/Profile/AppointmentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// ─── Shared header options ────────────────────────────────────────────────────
const headerOpts = {
  headerStyle: { backgroundColor: COLORS.white },
  headerTintColor: COLORS.primary,
  headerTitleStyle: { fontWeight: '700', color: COLORS.textPrimary, fontSize: 16 },
  headerBackTitle: '',
};

// ─── Stack: Home ─────────────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverDetail" component={DriverDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Réserver' }} />
      <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Mes favoris' }} />
    </Stack.Navigator>
  );
}

// ─── Stack: Catalogue ────────────────────────────────────────────────────────
function CatalogueStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="CatalogueMain" component={CatalogueScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverDetail" component={DriverDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Réserver' }} />
      <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ─── Stack: Bookings ─────────────────────────────────────────────────────────
function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="BookingsMain" component={BookingsListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Détail réservation' }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverDetail" component={DriverDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ─── Stack: Profile ──────────────────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Mes favoris' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ─── Main Tabs (4 tabs) ───────────────────────────────────────────────────────
function MainTabs() {
  const { isAuthenticated } = useAuth();

  const authGuardListener = (tabName) => ({
    tabPress: (e) => {
      if (!isAuthenticated && ['Bookings', 'Profile'].includes(tabName)) {
        e.preventDefault();
        rootNavigationRef.current?.navigate('AuthModal', { screen: 'Login' });
      }
    },
  });

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Catalogue" component={CatalogueStack} />
      <Tab.Screen
        name="Bookings"
        component={BookingsStack}
        listeners={isAuthenticated ? undefined : authGuardListener('Bookings')}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        listeners={isAuthenticated ? undefined : authGuardListener('Profile')}
      />
    </Tab.Navigator>
  );
}

// ─── Auth Stack ───────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export const rootNavigationRef = React.createRef();

export default function AppNavigator() {
  const { loading, isAuthenticated } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    storage.getItem('@tda_onboarding_done').then((val) => {
      setOnboardingDone(val === 'true');
    });
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && onboardingDone) {
      rootNavigationRef.current?.navigate('AuthModal', { screen: 'Login' });
    }
  }, [isAuthenticated, loading, onboardingDone]);

  if (loading || onboardingDone === null) return <LoadingScreen />;

  return (
    <NavigationContainer ref={rootNavigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingDone && (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="AuthModal"
          component={AuthStack}
          options={{ presentation: 'modal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
