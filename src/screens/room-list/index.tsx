import React, { ReactElement, useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SearchBar, ListItem, Icon } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { FloatingAction } from "react-native-floating-action";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_ENDPOINT } from "../home/index";
import Dialog from "react-native-dialog";
import { Picker } from "@react-native-picker/picker";
import { Deck } from "../../entities/Deck";
import {
  createConnection,
  getRepository,
  getConnectionManager,
} from "typeorm/browser";

type Room = { name: string; id: string; num: number };

export default function RoomListScreen({
  navigation,
}: {
  navigation: RoomListScreenNavigationProp;
}): ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [displayData, setDisplayData] = useState<Room[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const isFocused = useIsFocused();
  const [endpoint, setEndPoint] = useState<string>(DEFAULT_ENDPOINT);
  const [roomListData, setRoomListData] = useState<Room[]>([]);
  const [updated, setUpdated] = useState(false);
  const websocket = useRef<WebSocket | null>(null);
  const [
    isVisibleRoomEnterConfirmDialog,
    setIsVisibleRoomEnterConfirmDialog,
  ] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [localDeckId, setLocalDeckId] = useState<number | string | undefined>(
    undefined
  );
  const [localDecks, setLocalDecks] = useState<Deck[]>([]);
  const [localDeckCardIds, setLocalDeckCardIds] = useState<number[]>([]);

  useEffect(() => {
    if (updated) {
      // WebSocket作成
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
          setRoomListData(json.data.rooms);
        }
      };
      // ローカルデッキ取得
      (async () => {
        const connectionManager = getConnectionManager();
        if (connectionManager.connections.length == 0) {
          await createConnection({
            database: "test",
            driver: require("expo-sqlite"),
            entities: [Deck],
            synchronize: true,
            type: "expo",
          });
        }
        const deckRepository = getRepository(Deck);
        const loadedDecks = await deckRepository.find();
        setLocalDecks(loadedDecks);
      })();
      return () => {
        // WebSocket切断
        if (websocket.current != null) {
          websocket.current.close();
        }
      };
    }
  }, [updated]);

  /** WebSocketのエンドポイント取得 */
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
      (async () => {
        setIsLoading(true);
        try {
          const endpointFromPreferences = await AsyncStorage.getItem(
            "@endpoint"
          );
          if (endpointFromPreferences != null) {
            setEndPoint(endpointFromPreferences);
          }
        } catch (error) {
          console.log(error);
        }
      })();
    }
    return () => {
      setUpdated(false);
      console.log("set updated false");
    };
  }, [isFocused]);

  useEffect(() => {
    if (typeof roomListData != "undefined") {
      setDisplayData(roomListData);
      setIsLoading(false);
    }
  }, [roomListData]);

  /** FlatListのアイテムを押したときのハンドラ */
  const handlePress: (id: string) => void = (id) => {
    setSelectedRoomId(id);
    setIsVisibleRoomEnterConfirmDialog(true);
  };

  /** 検索フィルタ */
  const searchFilter = (text: string) => {
    setIsLoading(true);
    setSearchInput(text);
    const newData = roomListData.filter((item: Room) => {
      const itemData = `${item.name.toUpperCase()} ${item.id}`;

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

  /** フローティングアクション一覧 */
  const floadtingActions = [
    {
      text: "Create Room",
      icon: <Icon color="#FFFFFF" name="add" />,
      name: "createRoom",
      position: 1,
    },
  ];

  const onRefresh = () => {
    if (
      websocket.current != null &&
      websocket.current.readyState == WebSocket.OPEN
    ) {
      websocket.current.send("/list");
    }
  };

  const onPressFloadtingActionIcons = (name: string | undefined) => {
    switch (name) {
      case "createRoom":
        navigation.navigate("CreateRoom", { endpoint: endpoint });
        break;
    }
  };

  const enterRoom = () => {
    if (websocket.current != null && selectedRoomId != null) {
      setIsVisibleRoomEnterConfirmDialog(false);
      navigation.navigate("Room", {
        roomid: selectedRoomId,
        endpoint: endpoint,
        cardIds: localDeckCardIds,
      });
    }
  };

  const onPickerValueChanged = async (itemValue: React.ReactText) => {
    const selectedDeckId = parseInt(itemValue.toString());
    // 2回呼ばれる対策
    if (selectedDeckId === localDeckId) {
      return;
    }
    if (Number.isNaN(selectedDeckId) && localDeckId == null) {
      return;
    }
    // デッキを変更
    if (Number.isNaN(selectedDeckId)) {
      setLocalDeckId(undefined);
      setLocalDeckCardIds([]);
    } else {
      if (localDeckId != null) {
        setLocalDeckId(selectedDeckId);
        const selectedLocalDeck = localDecks.filter(
          (deck) => deck.id == selectedDeckId
        )[0];
        setLocalDeckCardIds(selectedLocalDeck.cardIds);
      } else {
        setLocalDeckId(selectedDeckId);
        const selectedLocalDeck = localDecks.filter(
          (deck) => deck.id == selectedDeckId
        )[0];
        setLocalDeckCardIds(selectedLocalDeck.cardIds);
      }
    }
  };
  const deckPicker = (
    selectedId: number | string | undefined,
    onPickerValueChanged: (
      itemValue: React.ReactText,
      itemIndex: number
    ) => void,
    pickerItems: Deck[]
  ) => {
    return (
      <Picker
        selectedValue={selectedId}
        style={styles.picker}
        onValueChange={onPickerValueChanged}
      >
        {/* <Picker.Item key="none" label="選択なし" value="none" /> */}
        {pickerItems.map((pickerItem) => {
          return (
            <Picker.Item
              key={pickerItem.id}
              label={pickerItem.name}
              value={pickerItem.id}
            />
          );
        })}
      </Picker>
    );
  };
  const roomEnterConfirmDialog = () => {
    return (
      <Dialog.Container visible={isVisibleRoomEnterConfirmDialog}>
        <Dialog.Title>デッキ選択</Dialog.Title>
        {deckPicker(localDeckId, onPickerValueChanged, localDecks)}
        <Dialog.Button
          label="キャンセル"
          onPress={() => setIsVisibleRoomEnterConfirmDialog(false)}
        />
        <Dialog.Button label="入室" onPress={enterRoom} />
      </Dialog.Container>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        placeholder="ルーム検索"
        lightTheme
        onChangeText={(text) => searchFilter(text)}
        autoCorrect={false}
        value={searchInput}
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          keyExtractor={keyExtractor}
          data={displayData}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        />
      )}
      <FloatingAction
        // overrideWithAction={true}
        actions={floadtingActions}
        color={"#03A9F4"}
        onPressItem={onPressFloadtingActionIcons}
      />
      {roomEnterConfirmDialog()}
    </SafeAreaView>
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
  picker: { width: 200 },
  subtitle: {
    flexDirection: "row",
    paddingLeft: 10,
    paddingTop: 5,
    color: "gray",
  },
});
