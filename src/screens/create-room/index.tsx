import React, { ReactElement, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Button, Input } from "react-native-elements";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { Formik } from "formik";
import * as Yup from "yup";
import { Deck } from "../../entities/Deck";
import {
  createConnection,
  getRepository,
  getConnectionManager,
} from "typeorm/browser";
import { isCreateRoomMessage, WsMessage } from "../../utils/ws-message";
import { useValueRef } from "../../utils/use-value-ref";
import { EnterRoomConfirmDialog } from "../../components/EnterRoomConfirmDialog";

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
  const [roomName, setRoomName] = useState("");
  const [localDeckId, setLocalDeckId] = useState<number | string | undefined>(
    undefined
  );
  const [localDecks, setLocalDecks] = useState<Deck[]>([]);
  const [localDeckCardIds, setLocalDeckCardIds] = useState<number[]>([]);
  const refLocalDeckCardIds = useValueRef(localDeckCardIds);

  useEffect(() => {
    // websocketの初期化
    websocket.current = new WebSocket(`ws://${endpoint}/ws`);
    websocket.current.onmessage = (event) => {
      const json: WsMessage = JSON.parse(event.data);
      if (isCreateRoomMessage(json)) {
        setIsVisibleRoomEnterConfirmDialog(false);
        navigation.navigate("Room", {
          roomid: json.data.id,
          endpoint: endpoint,
          cardIds: refLocalDeckCardIds.current,
        });
      } else {
        // TODO ルームに入ったら切断されるようにする
        console.log(
          `Unexpected Event. Status: ${json.status}; Event: ${json.event}; Data: ${json.data}`
        );
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

  // TODO ボイラープレートを避ける
  const onPickerValueChanged = (itemValue: React.ReactText) => {
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
        onSubmit={(values) => {
          setRoomName(values.name);
          setIsVisibleRoomEnterConfirmDialog(true);
        }}
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
      <EnterRoomConfirmDialog
        visible={isVisibleRoomEnterConfirmDialog}
        selectedDeckId={localDeckId}
        onPickerValueChanged={onPickerValueChanged}
        decks={localDecks}
        onPressCancelButton={() => setIsVisibleRoomEnterConfirmDialog(false)}
        onPressEnterButton={() => {
          if (websocket.current != null) {
            websocket.current.send(`/create ${roomName}`);
          }
        }}
      />
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
});
