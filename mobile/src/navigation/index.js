import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import ComplaintDetailScreen from "../screens/ComplaintDetailScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import MyComplaintsScreen from "../screens/MyComplaintsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ReportComplaintScreen from "../screens/ReportComplaintScreen";
import WeatherScreen from "../screens/WeatherScreen";
import { colors } from "../theme";

const Stack = createNativeStackNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "800" },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Smart City" }}
      />
      <Stack.Screen
        name="ReportComplaint"
        component={ReportComplaintScreen}
        options={{ title: "Report Complaint" }}
      />
      <Stack.Screen
        name="MyComplaints"
        component={MyComplaintsScreen}
        options={{ title: "My Complaints" }}
      />
      <Stack.Screen
        name="ComplaintDetail"
        component={ComplaintDetailScreen}
        options={{ title: "Complaint" }}
      />
      <Stack.Screen name="Weather" component={WeatherScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
