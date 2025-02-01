import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import supabase from "../utils/supabaseClient";

export default function GlobalFeed() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data, error } = await supabase
          .from("images")
          .select("image_name, id")
          .order("uploaded_at", { ascending: true });

        if (error) throw new Error(error.message);

        //create signedurl for each image
        const imagesWithUrls = await Promise.all(
          data.map(async (image) => {
            const { data: signedUrlData, error: urlError } =
              await supabase.storage
                .from("images")
                .createSignedUrl(image.image_name, 60 * 60);

            if (urlError) {
              console.error("Signed URL Error:", urlError);
              return null;
            }
            return { ...image, signedUrl: signedUrlData.signedUrl };
          })
        );
        setImages(imagesWithUrls);
      } catch (e) {
        console.error("Error fetching images:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.signedUrl }} style={styles.image} />
        </View>
      )}
    />
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  imageContainer: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    marginTop: -120,
  },
  image: {
    width: width * 0.95,
    height: height * 0.7,
    borderRadius: 25,
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
});
