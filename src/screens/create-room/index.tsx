import React, { ReactElement, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Button, Input } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { Formik } from "formik";
import * as Yup from "yup";
import Dialog from "react-native-dialog";
import { Picker } from "@react-native-picker/picker";
import { Deck } from "../../entities/Deck";
import {
  createConnection,
  getRepository,
  getConnectionManager,
} from "typeorm/browser";

export default function CreateRoomScreen({
  route,
  navigation,
}: {
  route: CreateRoomScreenRouteProp;
  navigation: CreateRoomScreenNavigationProp;
}): ReactElement {
  const { endpoint } = route.params;
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
    websocket.current = new WebSocket(`ws://${endpoint}/ws`);
    websocket.current.onmessage = (event) => {
      if (event.data.startsWith("{")) {
        const json = JSON.parse(event.data);
        if (json.status === "ok") {
          setSelectedRoomId(json.data.id);
          setIsVisibleRoomEnterConfirmDialog(true);
        }
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
      if (websocket.current != null) {
        websocket.current.close();
      }
    };
  }, []);

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

  const onSubmit = async (values: { name: string }) => {
    // データ送信
    console.log(values);
    if (websocket.current != null) {
      websocket.current.send(`/create ${values.name}`);
    }
  };

  const schema = Yup.object().shape({
    name: Yup.string()
      .min(3, "3文字以上で入力してください")
      .max(20, "20文字以内で入力してください")
      .required("ルーム名を入力してください"),
  });
  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          name: "",
        }}
        validateOnMount
        validationSchema={schema}
        onSubmit={(values) => onSubmit(values)}
      >
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          isValid,
          isSubmitting,
          values,
          errors,
          touched,
        }) => (
          <>
            <View>
              {errors.name && touched.name ? <Text>{errors.name}</Text> : null}
            </View>
            <Input
              label="新規ルーム名"
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              placeholder="ルーム名を入力してください"
            />
            <Button
              title="Submit"
              onPress={() => handleSubmit()}
              disabled={!isValid || isSubmitting}
              style={styles.button}
            />
          </>
        )}
      </Formik>
      {roomEnterConfirmDialog()}
    </View>
  );
}

type CreateRoomScreenRouteProp = RouteProp<RootStackParamList, "CreateRoom">;
type CreateRoomScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CreateRoom"
>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: { margin: 10 },
  picker: { width: 200 },
});
