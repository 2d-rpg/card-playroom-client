import React, { ReactElement, useState, useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { SearchBar, ListItem } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { gql, useQuery, useMutation } from "@apollo/client";

const ROOMS_QUERY = gql`
  query {
    rooms {
      id
      name
    }
  }
`;

const ENTER_ROOM = gql`
  mutation EnterRoom($player: String!, $roomId: Int!) {
    enterRoom(player: $player, roomId: $roomId) {
      id
      name
      players
    }
  }
`;

export default function RoomListScreen({
  navigation,
}: {
  navigation: RoomListScreenNavigationProp;
}): ReactElement {
  const [isLoading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [result, setResult] = useState([]);
  const [text, setText] = useState("");
  const { data, loading, error } = useQuery(ROOMS_QUERY);
  const [enterRoom] = useMutation(ENTER_ROOM, {
    onCompleted: (data) => {
      console.log(data.enterRoom.id);
      navigation.navigate("Room", { id: data.enterRoom.id });
    },
  });

  useEffect(() => {
    if (typeof data != "undefined") {
      setDisplayData(data.rooms);
      setResult(data.rooms);
      setLoading(loading);
    }
  }, [data]);

  const handlePress: (id: string) => void = (id) => {
    enterRoom({ variables: { player: "", roomId: parseInt(id) } });
  };

  const searchFilter = (text: string) => {
    setLoading(true);
    setText(text);
    const newData = result.filter((item: { name: string; id: string }) => {
      const itemData = `${item.name.toUpperCase()} ${item.id.toUpperCase()}`;

      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });

    setDisplayData(newData);
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

  if (error) console.log(error.message);

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
          data={displayData}
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
