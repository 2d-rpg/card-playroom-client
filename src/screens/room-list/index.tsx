import React, { ReactElement, useState, useEffect, useRef } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { SearchBar, ListItem, Icon } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { FloatingAction } from "react-native-floating-action";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_ENDPOINT } from "../home/index";

type Room = { name: string; id: number; num: number };
type RoomList = Room[];

export default function RoomListScreen({
  navigation,
}: {
  navigation: RoomListScreenNavigationProp;
}): ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [displayData, setDisplayData] = useState<RoomList>([]);
  const [text, setText] = useState("");
  const isFocused = useIsFocused();
  const [endpoint, setEndPoint] = useState<string>(DEFAULT_ENDPOINT);
  const [data, setData] = useState<RoomList>([]);
  const [updated, setUpdated] = useState(false);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (updated) {
      websocket.current = new WebSocket(`ws://${endpoint}/ws`);
      websocket.current.onopen = () => {
        console.log("opened");
        if (websocket.current != null) {
          websocket.current.send("/list");
        }
      };
      websocket.current.onmessage = (event) => {
        console.log(event.data);
        if (event.data.startsWith("{")) {
          const json = JSON.parse(event.data);
          setData(json.data);
        }
      };
      return () => {
        if (websocket.current != null) {
          console.log("websocket closed");
          websocket.current.close();
        }
      };
    }
  }, [updated]);

  const getEndPoint = async () => {
    let endpointFromPreferences = DEFAULT_ENDPOINT;
    try {
      endpointFromPreferences =
        (await AsyncStorage.getItem("@endpoint")) || DEFAULT_ENDPOINT;
    } catch (error) {
      console.log(error);
    } finally {
      setEndPoint(endpointFromPreferences);
      setUpdated(true);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      getEndPoint();
    }
    return () => {
      setUpdated(false);
      console.log("set updated false");
    };
  }, [isFocused]);

  useEffect(() => {
    if (typeof data != "undefined") {
      setDisplayData(data);
      setIsLoading(false);
    }
  }, [data]);

  const handlePress: (id: number) => void = (id) => {
    if (websocket.current != null) {
      navigation.navigate("Room", { roomid: id, endpoint: endpoint });
    }
  };

  const searchFilter = (text: string) => {
    setIsLoading(true);
    setText(text);
    const newData = data.filter((item: { name: string }) => {
      const itemData = `${item.name.toUpperCase()}`;

      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });

    setDisplayData(newData);
    setIsLoading(false);
  };

  const keyExtractor = (_item: Room, index: number) => index.toString();

  const renderItem = ({ item }: { item: Room }) => (
    <ListItem bottomDivider onPress={() => handlePress(item.id)}>
      <ListItem.Content>
        <ListItem.Title style={styles.title}>{item.name}</ListItem.Title>
        <ListItem.Subtitle style={styles.subtitle}>{item.id}</ListItem.Subtitle>
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
    {
      text: "Update List",
      icon: <Icon color="#FFFFFF" type="antdesign" name="reload1" />,
      name: "updateList",
      position: 2,
    },
  ];

  const onPressFloadtingActionIcons = (name: string | undefined) => {
    switch (name) {
      case "createRoom":
        navigation.navigate("CreateRoom", { endpoint: endpoint });
        break;
      case "updateList":
        if (
          websocket.current != null &&
          websocket.current.readyState == WebSocket.OPEN
        ) {
          websocket.current.send("/list");
        }
        break;
    }
  };

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
        // overrideWithAction={true}
        actions={floadtingActions}
        color={"#03A9F4"}
        onPressItem={onPressFloadtingActionIcons}
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
