import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import supabase from "../utils/supabaseClient";

export default function PreviewScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const { photoUri } = route.params;

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

  const handleUpload = async () => {
    if (uploading || !user) return;

    setUploading(true);
    const timestamp = Date.now();
    const fileName = `outfits/${timestamp}.jpg`;

    try {
      const { data, error } = await supabase.storage.from("images").upload(
        fileName,
        {
          uri: photoUri,
          type: "image/jpeg",
          name: fileName,
        },
        {
          contentType: "image/jpeg",
        }
      );

      if (error) throw new Error(error.message);

      const { error: insertError } = await supabase.from("images").insert([
        {
          user_id: user.id,
          image_name: fileName,
          uploaded_at: new Date(),
        },
      ]);

      if (insertError) throw new Error(insertError.message);
      navigation.navigate("Home", { screen: "FollowingFeed" });
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.fullImage} />
      ) : (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={40} color="#fff" />
        </TouchableOpacity>
      )}

      <View>
        <TouchableOpacity
          style={styles.redoButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-outline" size={40} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={handleUpload}>
          <Ionicons name="send-outline" size={45} color="#fff" />
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  fullImage: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  sendButton: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  redoButton: {
    position: "absolute",
    top: -725,
    left: 20,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
