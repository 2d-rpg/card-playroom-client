import * as React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Room Screen</Text>
      <Button title="ホーム画面へ戻る" onPress={() => navigation.goBack()} />
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
