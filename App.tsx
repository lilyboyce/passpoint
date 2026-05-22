import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import { AppProvider } from './src/context/AppContext';
import { navigationRef } from './src/navigation/navigationRef';
import { RootStackParamList } from './src/navigation';

import HomeScreen from './src/screens/HomeScreen';
import CardsScreen from './src/screens/CardsScreen';
import MerchantLookupScreen from './src/screens/MerchantLookupScreen';
import BenefitsScreen from './src/screens/BenefitsScreen';
import CardDetailScreen from './src/screens/CardDetailScreen';
import AddCardScreen from './src/screens/AddCardScreen';
import AddCardDateScreen from './src/screens/AddCardDateScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.35 }}>{label}</Text>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#000',
          backgroundColor: '#fff',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#aaa',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="⌂" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Cards"
        component={CardsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="▣" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Lookup"
        component={MerchantLookupScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="⌕" focused={focused} />,
          tabBarLabel: 'Lookup',
        }}
      />
      <Tab.Screen
        name="Benefits"
        component={BenefitsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="◇" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="CardDetail" component={CardDetailScreen} />
            <Stack.Screen
              name="AddCard"
              component={AddCardScreen}
              options={{ presentation: 'modal', gestureEnabled: false }}
            />
            <Stack.Screen
              name="AddCardDate"
              component={AddCardDateScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
