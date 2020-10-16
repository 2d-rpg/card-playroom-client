import React, { ReactElement, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import SearchTextInput from "../../components/SearchTextInput";

export default function RoomListScreen({
  navigation,
  socket,
}: {
  navigation: RoomListScreenNavigationProp;
  socket: SocketIOClient.Socket;
}): ReactElement {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost/rooms")
      .then((response) => response.json())
      .then((json) => setData(json.rooms))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const handlePress: (id: string) => void = (id) => {
    fetch("http://localhost/room", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        socket: socket,
      }),
    }).then(() => navigation.navigate("Room", { socket: socket }));
  };

  return (
    <View style={styles.container}>
      <Text>Room List Screen</Text>
      <SearchTextInput />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }: { item: { name: string; id: string } }) => (
            <View style={styles.item}>
              <Button
                title={`${item.name} ${item.id}`}
                onPress={() => handlePress(item.id)}
              />
            </View>
          )}
        />
      )}
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
