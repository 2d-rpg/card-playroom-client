import { StatusBar } from "expo-status-bar";
import React, { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { Button } from "react-native-elements";

export default function HomeScreen({
  navigation,
}: {
  navigation: HomeScreenNavigationProp;
}): ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button
            title="ルーム作成"
            onPress={() => navigation.navigate("Room")}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="ルーム参加"
            onPress={() => navigation.navigate("RoomList")}
          />
        </View>
      </View>
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button
            title="デッキ編集"
            onPress={() => navigation.navigate("EditDeck")}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="設定"
            onPress={() => navigation.navigate("Preferences")}
          />
        </View>
      </View>
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
  buttons: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    flex: 0.5,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
