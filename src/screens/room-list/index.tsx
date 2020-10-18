import React, { ReactElement, useEffect, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { SearchBar, ListItem } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { ENDPOINT } from "@env";

export default function RoomListScreen({
  navigation,
}: {
  navigation: RoomListScreenNavigationProp;
}): ReactElement {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [result, setResult] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(ENDPOINT + ":8080/rooms", {
      mode: "no-cors",
    })
      .then((response: Response) => response.json())
      .then((json) => {
        setData(json.rooms);
        setResult(json.rooms);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const handlePress: (id: string) => void = (id) => {
    fetch(ENDPOINT + ":8080/room", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    }).then(() => navigation.navigate("Room"));
  };

  const searchFilter = (text: string) => {
    setLoading(true);
    setText(text);
    const newData = result.filter((item: { name: string; id: string }) => {
      const itemData = `${item.name.toUpperCase()} ${item.id.toUpperCase()}`;

      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });

    setData(newData);
    setLoading(false);
  };

  const keyExtractor = (_item: { name: string; id: string }, index: number) =>
    index.toString();

  const renderItem = ({ item }: { item: { name: string; id: string } }) => (
    <ListItem bottomDivider onPress={() => handlePress(item.id)}>
      <ListItem.Content>
        <ListItem.Title style={styles.title}>{item.name}</ListItem.Title>
        <ListItem.Subtitle style={styles.subtitle}>{item.id}</ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );

  return (
    <View>
      <SearchBar
        placeholder="ルーム検索"
        lightTheme
        onChangeText={(text) => searchFilter(text)}
        autoCorrect={false}
        value={text}
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          keyExtractor={keyExtractor}
          data={data}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

type RoomListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RoomList"
>;

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "400",
    paddingLeft: 10,
  },
  subtitle: {
    flexDirection: "row",
    paddingLeft: 10,
    paddingTop: 5,
    color: "gray",
  },
});
