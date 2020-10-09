import { StatusBar } from "expo-status-bar";
import React, { ReactElement } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";

export default function HomeScreen({
  navigation,
}: {
  navigation: HomeScreenNavigationProp;
}): ReactElement {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      <Button title="ルーム作成" onPress={() => navigation.navigate("Room")} />
      <StatusBar style="auto" />
    </View>
  );
}

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
