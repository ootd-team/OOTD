import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import supabase from "../utils/supabaseClient";
import TabNavigator from "./TabNavigator";
import LoginNavigator from "../navigation/LoginNavigator";
import LoadingScreen from "../components/LoadingScreen";
import HomeSearch from "../screens/HomeSearch";
import ProfileSetupScreen from "../screens/ProfileSetup";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(true);

  const checkProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    setHasProfile(!!data && !error);
  };

  useEffect(() => {
    async function checkUserSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setInitializing(false);

      if (user) {
        checkProfile(user.id);
      }
    }

    checkUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          checkProfile(currentUser.id);
        } else {
          setHasProfile(true);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        hasProfile ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="HomeSearch" component={HomeSearch} />
          </>
        ) : (
          <Stack.Screen
            name="ProfileSetup"
            component={ProfileSetupScreen}
            options={{ gestureEnabled: false }}
          />
        )
      ) : (
        <Stack.Screen name="LoginNav" component={LoginNavigator} />
      )}
    </Stack.Navigator>
  );
}
