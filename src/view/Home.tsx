import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";

export default function HomeScreen({ navigation }): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      <Button title="ルーム作成" onPress={() => navigation.navigate("Room")} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
