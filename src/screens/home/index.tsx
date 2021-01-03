import { StatusBar } from "expo-status-bar";
import React, { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { Button, ThemeProvider, Text } from "react-native-elements";

const theme = {
  Button: {
    containerStyle: {
      margin: 40,
    },
  },
};

export default function HomeScreen({
  navigation,
}: {
  navigation: HomeScreenNavigationProp;
}): ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <Text h1>Card Playroom</Text>
      <Button
        title="ルーム作成"
        onPress={() => navigation.navigate("CreateRoom")}
      />
      <Button
        title="ルーム参加"
        onPress={() => navigation.navigate("RoomList")}
      />
      <Button
        title="デッキ編集"
        onPress={() => navigation.navigate("EditDeck")}
      />
      <Button title="設定" onPress={() => navigation.navigate("Preferences")} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
