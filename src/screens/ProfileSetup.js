import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Button, Input } from "@rneui/themed";
import supabase from "../utils/supabaseClient";

export default function ProfileSetup({ navigation }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
      } else {
        setUser(data.user);
      }
    };
    getUser();
  }, []);

  const handleCompleteProfile = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name,
        username,
      });

      if (error) throw error;

      await supabase.auth.refreshSession();
    } catch (error) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Input
        label="Full Name"
        value={name}
        onChangeText={setName}
        containerStyle={styles.inputContainer}
      />
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        containerStyle={styles.inputContainer}
        autoCapitalize="none"
      />
      <Button
        title="Complete Setup"
        loading={loading}
        onPress={handleCompleteProfile}
        buttonStyle={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4a90e2",
    paddingVertical: 15,
    borderRadius: 8,
  },
});
