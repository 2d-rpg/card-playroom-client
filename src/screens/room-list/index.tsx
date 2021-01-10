import React, { ReactElement, useState, useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { SearchBar, ListItem } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { FloatingAction } from "react-native-floating-action";
import { Icon } from "react-native-elements";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RoomListScreen({
  navigation,
}: {
  navigation: RoomListScreenNavigationProp;
}): ReactElement {
  const [isLoading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [result, setResult] = useState([]);
  const [text, setText] = useState("");
  const isFocused = useIsFocused();
  const [endpoint, setEndPoint] = useState<string>("127.0.0.1");
  const [data, setData] = useState([]);
  // const { data, loading, error } = useQuery(ROOMS_QUERY);
  // const [enterRoom] = useMutation(ENTER_ROOM, {
  //   onCompleted: (data) => {
  //     console.log(data.enterRoom.id);
  //     navigation.navigate("Room", { id: data.enterRoom.id });
  //   },
  // });

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      (async () => {
        const endpointFromPreferences = await AsyncStorage.getItem("@endpoint");
        if (endpointFromPreferences != null) {
          setEndPoint(endpointFromPreferences);
        }
        const websocket = new WebSocket(`ws://${endpoint}/ws`);
        websocket.onopen = () => {
          websocket.send("/list");
        };
        websocket.onmessage = (event) => {
          console.log(event.data);
          setData(JSON.parse(event.data).data);
        };
      })();
    }
  }, [isFocused]);

  useEffect(() => {
    if (typeof data != "undefined") {
      setDisplayData(data);
      setResult(data);
      setLoading(false);
    }
  }, [data]);

  const handlePress: (name: string) => void = (name) => {
    const websocket = new WebSocket(`ws://${endpoint}/ws`);
    websocket.onopen = () => {
      websocket.send(`/join ${name}`);
      navigation.navigate("Room", { name: name });
    };
  };

  const searchFilter = (text: string) => {
    setLoading(true);
    setText(text);
    const newData = result.filter((item: { name: string }) => {
      const itemData = `${item.name.toUpperCase()}`;

      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });

    setDisplayData(newData);
    setLoading(false);
  };

  const keyExtractor = (_item: { name: string }, index: number) =>
    index.toString();

  const renderItem = ({ item }: { item: { name: string } }) => (
    <ListItem bottomDivider onPress={() => handlePress(item.name)}>
      <ListItem.Content>
        <ListItem.Title style={styles.title}>{item.name}</ListItem.Title>
        {/* <ListItem.Subtitle style={styles.subtitle}>{item.id}</ListItem.Subtitle> */}
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  const floadtingActions = [
    {
      text: "Create Room",
      icon: <Icon color="#FFFFFF" name="add" />,
      name: "createRoom",
      position: 1,
    },
  ];

  return (
    <View style={styles.container}>
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
      <FloatingAction
        overrideWithAction={true}
        actions={floadtingActions}
        color={"#03A9F4"}
        onPressItem={() => navigation.navigate("CreateRoom")}
      />
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
  },
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
