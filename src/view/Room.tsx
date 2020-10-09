import React, { ReactElement } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";

export default function HomeScreen({
  navigation,
}: {
  navigation: RoomScreenNavigationProp;
}): ReactElement {
  return (
    <View style={styles.container}>
      <Text>Room Screen</Text>
      <Button title="ホーム画面へ戻る" onPress={() => navigation.goBack()} />
    </View>
  );
}

type RoomScreenNavigationProp = StackNavigationProp<RootStackParamList, "Room">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
