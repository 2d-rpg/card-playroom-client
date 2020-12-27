import React, { ReactElement } from "react";
import { StyleSheet, View, Text, Button, FlatList } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import SearchTextInput from "../../components/SearchTextInput";

export default function RoomListScreen({
  navigation,
}: {
  navigation: RoomListScreenNavigationProp;
}): ReactElement {
  return (
    <View style={styles.container}>
      <Text>Room List Screen</Text>
      <SearchTextInput />
      <FlatList
        data={[
          { key: "ルーム1" },
          { key: "ルーム2" },
          { key: "ルーム3" },
          { key: "ルーム4" },
          { key: "ルーム5" },
          { key: "ルーム6" },
          { key: "ルーム7" },
          { key: "ルーム8" },
          { key: "ルーム9" },
          { key: "ルーム10" },
        ]}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Button
              title={item.key}
              onPress={() => navigation.navigate("Room")}
            />
          </View>
        )}
      />
      <Button title="ホーム画面へ戻る" onPress={() => navigation.goBack()} />
    </View>
  );
}

type RoomListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RoomList"
>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    margin: 10,
    fontSize: 18,
    height: 44,
  },
});
