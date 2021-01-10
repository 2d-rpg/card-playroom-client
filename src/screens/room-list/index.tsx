import React, { ReactElement, useState, useEffect, useRef } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { SearchBar, ListItem } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { FloatingAction } from "react-native-floating-action";
import { Icon } from "react-native-elements";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFOULT_VALUE = "127.0.0.1";

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
  const [endpoint, setEndPoint] = useState<string>(DEFOULT_VALUE);
  const [data, setData] = useState([]);
  const [updated, setUpdated] = useState(false);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (updated) {
      websocket.current = new WebSocket(`ws://${endpoint}/ws`);
      websocket.current.onopen = () => {
        console.log("opened");
        if (websocket.current != null) {
          console.log("not null");
          websocket.current.send("/list");
        } else {
          console.log("null");
        }
      };
      websocket.current.onmessage = (event) => {
        console.log(event.data);
        if (event.data.startsWith("{")) {
          setData(JSON.parse(event.data).data);
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
    let endpointFromPreferences = DEFOULT_VALUE;
    try {
      endpointFromPreferences =
        (await AsyncStorage.getItem("@endpoint")) || DEFOULT_VALUE;
    } catch (error) {
      console.log(error);
    } finally {
      setEndPoint(endpointFromPreferences);
      setUpdated(true);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
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
      setResult(data);
      setLoading(false);
    }
  }, [data]);

  const handlePress: (name: string) => void = (name) => {
    if (websocket.current != null) {
      navigation.navigate("Room", { roomname: name, endpoint: endpoint });
    }
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
        onPressItem={() =>
          navigation.navigate("CreateRoom", { endpoint: endpoint })
        }
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
