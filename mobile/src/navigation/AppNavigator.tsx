import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from '../screens/Dashboard';
import Tracks from '../screens/Tracks';
import Practice from '../screens/Practice';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Dashboard"
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#0a0a0a' },
                }}
            >
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="Tracks" component={Tracks} />
                <Stack.Screen name="Practice" component={Practice} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
