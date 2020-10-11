import { StatusBar } from "expo-status-bar";
import React, { ReactElement } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";

export default function EditDeckScreen({
  navigation,
}: {
  navigation: EditDeckScreenNavigationProp;
}): ReactElement {
  return (
    <View style={styles.container}>
      <Text>Edit Deck Screen</Text>
      <Button
        title="ホーム画面に戻る"
        onPress={() => navigation.navigate("Home")}
      />
      <StatusBar style="auto" />
    </View>
  );
}

type EditDeckScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditDeck"
>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
