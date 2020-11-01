import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, FlatList } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import Card from "../../components/Card";
import { Picker } from "@react-native-community/picker";
import { ImageProps } from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";
import {
  createConnection,
  getRepository,
  getConnectionManager,
} from "typeorm/browser";
import { Deck } from "../../entities/Deck";
import Dialog from "react-native-dialog";

export default function EditDeckScreen({
  navigation,
}: {
  navigation: EditDeckScreenNavigationProp;
}): ReactElement {
  const [serverDeckId, setServerDeckId] = useState<number | undefined>(
    undefined
  );
  const [serverDeckCardIds, setServerDeckCardIds] = useState<number[]>([]);
  const [localDeckId, setLocalDeckId] = useState<number | undefined>(undefined);
  const [tempCardIds, setTempCardIds] = useState<number[]>([]);
  const [localDecks, setLocalDecks] = useState<Deck[]>([]);
  const [
    changeDeckNameDialogVisible,
    setChangeDeckNameDialogVisible,
  ] = useState(false);
  const [tempDeckName, setTempDeckName] = useState("");

  // 最初にローカルに保存されているデッキをロード
  useEffect(() => {
    function connect() {
      return createConnection({
        database: "test",
        driver: require("expo-sqlite"),
        entities: [Deck],
        synchronize: true,
        type: "expo",
      });
    }
    async function loadDecks() {
      const connectionManager = getConnectionManager();
      if (connectionManager.connections.length == 0) {
        await connect();
      }
      const deckRepository = getRepository(Deck);
      const loadedDecks = await deckRepository.find();
      setLocalDecks(loadedDecks);
    }
    loadDecks();
  }, []);

  // 表示カードの型
  type renderedCard = {
    id: number;
    cardId: number;
    faceUrl: ImageProps;
    backUrl: ImageProps;
  };

  // TODO Rustサーバーからデッキをインポート
  const serverDecks: Deck[] = [
    {
      id: 1,
      name: "トランプ",
      cardIds: [1, 2, 1, 1, 1, 1, 1],
    },
    {
      id: 2,
      name: "トランプ2",
      cardIds: [3, 4],
    },
  ];
  const cards: {
    id: number;
    face: ImageProps;
    back: ImageProps;
    groupId: number;
  }[] = [
    {
      id: 1,
      face: require("../../../assets/default/face/card_club_01.png"),
      back: require("../../../assets/default/back/card_back.png"),
      groupId: 1,
    },
    {
      id: 2,
      face: require("../../../assets/default/face/card_club_02.png"),
      back: require("../../../assets/default/back/card_back.png"),
      groupId: 1,
    },
    {
      id: 3,
      face: require("../../../assets/default/face/card_club_03.png"),
      back: require("../../../assets/default/back/card_back.png"),
      groupId: 2,
    },
    {
      id: 4,
      face: require("../../../assets/default/face/card_club_04.png"),
      back: require("../../../assets/default/back/card_back.png"),
      groupId: 2,
    },
  ];

  // サーバーのデッキのカードの描画
  const renderServerDeckItem = ({ item }: { item: renderedCard }) => {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    // 下スワイプでローカルのデッキにカードを追加
    // TODO アニメーション
    const onSwipeDown = () => {
      if (tempCardIds != null && localDeckId != null) {
        const copyTempDeckCardIds = [...tempCardIds, item.cardId];
        setTempCardIds(copyTempDeckCardIds);
      }
    };
    return (
      <GestureRecognizer onSwipeDown={() => onSwipeDown()} config={config}>
        <Card faceUrl={item.faceUrl} backUrl={item.backUrl} />
      </GestureRecognizer>
    );
  };

  // ローカルのデッキのカードの描画
  // TODO 同じカードの描画の際カード下に枚数を表示
  // TODO カードの並べ替え，ソートをできるようにする
  const renderLocalDeckItem = ({ item }: { item: renderedCard }) => {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    // 上スワイプでローカルのデッキからカードを削除
    // TODO アニメーション
    const onSwipeUp = () => {
      if (tempCardIds != null) {
        const copyTempDeckCardIds = Array.from(tempCardIds);
        const index = copyTempDeckCardIds.findIndex((id) => id == item.cardId);
        copyTempDeckCardIds.splice(index, 1);
        setTempCardIds(copyTempDeckCardIds);
      }
    };
    return (
      <GestureRecognizer onSwipeUp={() => onSwipeUp()} config={config}>
        <Card faceUrl={item.faceUrl} backUrl={item.backUrl} />
      </GestureRecognizer>
    );
  };

  // サーバーのデッキ選択処理
  const onServerDeckPickerValueChanged = (itemValue: React.ReactText) => {
    const selectedGroupId = parseInt(itemValue.toString());
    // 2回呼ばれる対策
    if (selectedGroupId === serverDeckId) {
      return;
    }
    if (Number.isNaN(selectedGroupId)) {
      setServerDeckId(undefined);
      setServerDeckCardIds([]);
    } else {
      const selectedDeck = serverDecks.filter(
        (serverDeck) => serverDeck.id == selectedGroupId
      )[0];
      setServerDeckId(selectedGroupId);
      setServerDeckCardIds(selectedDeck.cardIds);
    }
  };

  // ローカルのデッキ選択処理
  const onLocalDeckPickerValueChanged = async (itemValue: React.ReactText) => {
    const selectedDeckId = parseInt(itemValue.toString());
    // 2回呼ばれる対策
    if (selectedDeckId === localDeckId) {
      return;
    }
    if (Number.isNaN(selectedDeckId) && localDeckId == null) {
      return;
    }
    // 現在のデッキを保存してから編集デッキを変更
    if (Number.isNaN(selectedDeckId)) {
      setLocalDeckId(undefined);
      const deckRepository = getRepository(Deck);
      await deckRepository.update(
        { id: localDeckId },
        { cardIds: tempCardIds }
      );
      const loadedDecks = await deckRepository.find();
      setLocalDecks(loadedDecks);
      setTempCardIds([]);
    } else {
      if (localDeckId != null) {
        setLocalDeckId(selectedDeckId);
        const deckRepository = getRepository(Deck);
        await deckRepository.update(
          { id: localDeckId },
          { cardIds: tempCardIds }
        );
        const loadedDecks = await deckRepository.find();
        setLocalDecks(loadedDecks);
        const selectedLocalDeck = localDecks.filter(
          (deck) => deck.id == selectedDeckId
        )[0];
        setTempCardIds(selectedLocalDeck.cardIds);
      } else {
        setLocalDeckId(selectedDeckId);
        const selectedLocalDeck = localDecks.filter(
          (deck) => deck.id == selectedDeckId
        )[0];
        setTempCardIds(selectedLocalDeck.cardIds);
      }
    }
  };

  // ローカル/サーバー のデッキ選択のためのセレクトボックス
  const cardGroupPicker = (
    selectedId: number | undefined,
    onPickerValueChanged: (
      itemValue: React.ReactText,
      itemIndex: number
    ) => void,
    pickerItems: Deck[]
  ) => {
    return (
      <Picker
        selectedValue={selectedId}
        style={{ height: 50, width: 200 }}
        onValueChange={onPickerValueChanged}
      >
        <Picker.Item label="選択なし" value="none" />
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

  // ローカル/サーバー のカードをリスト表示
  const cardGroupFlatList = (
    selectedId: number | undefined,
    cardIds: number[],
    renderItem: ({ item }: { item: renderedCard }) => JSX.Element
  ) => {
    if (selectedId == null) {
      return <Text>選択してください</Text>;
    } else {
      const flatListItems = cardIds.map((cardId, index) => {
        const selectedCard = cards.filter((card) => card.id == cardId)[0];
        return {
          id: index,
          cardId: cardId,
          faceUrl: selectedCard.face,
          backUrl: selectedCard.back,
        };
      });
      return (
        <FlatList
          data={flatListItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
        ></FlatList>
      );
    }
  };

  // デッキ削除
  const deleteDeck = async () => {
    const deleteDeckId = localDeckId;
    setLocalDeckId(undefined);
    setTempCardIds([]);
    const deckRepository = getRepository(Deck);
    await deckRepository.delete({ id: deleteDeckId }).then(() => {
      const copyDecks = Array.from(localDecks);
      const index = copyDecks.findIndex((deck) => deck.id == deleteDeckId);
      copyDecks.splice(index, 1);
      setLocalDecks(copyDecks);
    });
  };
  const deckDeleteButton = (deleteDeckId: number | undefined) => {
    if (deleteDeckId != null) {
      return <Button title="デッキ削除" onPress={deleteDeck} />;
    }
  };

  // デッキ作成
  const createDeck = async () => {
    const deckRepository = getRepository(Deck);
    if (localDeckId != null) {
      await deckRepository.update(
        { id: localDeckId },
        { cardIds: tempCardIds }
      );
      const loadedDecks = await deckRepository.find();
      setLocalDecks(loadedDecks);
    }
    const newDeck = new Deck();
    newDeck.name = "新しいデッキ";
    newDeck.cardIds = [];
    await deckRepository.save(newDeck).then((deck) => {
      const copyDecks = [...localDecks, deck];
      setLocalDecks(copyDecks);
      setLocalDeckId(deck.id);
      setTempCardIds(deck.cardIds);
    });
  };

  // デッキ名変更
  const saveDeckName = async () => {
    if (localDeckId != null) {
      const selectedDeck = localDecks.filter(
        (localDeck) => localDeck.id == localDeckId
      )[0];
      selectedDeck.name = tempDeckName;
      setLocalDecks(localDecks);
      const deckRepository = getRepository(Deck);
      await deckRepository.update({ id: localDeckId }, { name: tempDeckName });
    }
    setChangeDeckNameDialogVisible(false);
  };
  const showDialog = () => {
    const selectedDeck = localDecks.filter(
      (localDeck) => localDeck.id == localDeckId
    )[0];
    setTempDeckName(selectedDeck.name);
    setChangeDeckNameDialogVisible(true);
  };
  const changeDeckNameButton = (deckId: number | undefined) => {
    if (deckId != null) {
      const selectedDeck = localDecks.filter(
        (localDeck) => localDeck.id == localDeckId
      )[0];
      return (
        <React.Fragment>
          <Button title="デッキ名変更" onPress={showDialog} />
          <Dialog.Container visible={changeDeckNameDialogVisible}>
            <Dialog.Title>デッキ名変更</Dialog.Title>
            <Dialog.Input
              label="デッキ名"
              onChangeText={(name: string) => setTempDeckName(name)}
            >
              {selectedDeck.name}
            </Dialog.Input>
            <Dialog.Button
              label="キャンセル"
              onPress={() => setChangeDeckNameDialogVisible(false)}
            />
            <Dialog.Button label="保存" onPress={saveDeckName} />
          </Dialog.Container>
        </React.Fragment>
      );
    }
  };

  // 編集中のデッキを保存し，ホームに戻る
  const saveDeck = async () => {
    const deckRepository = getRepository(Deck);
    console.log(localDeckId);
    if (localDeckId != null) {
      await deckRepository.update(
        { id: localDeckId },
        { cardIds: tempCardIds }
      );
    }
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Button title="デッキ編集完了" onPress={saveDeck} />
      <Text>カード一覧</Text>
      {cardGroupPicker(
        serverDeckId,
        onServerDeckPickerValueChanged,
        serverDecks
      )}
      {cardGroupFlatList(serverDeckId, serverDeckCardIds, renderServerDeckItem)}
      <Text>デッキ</Text>
      <Button title="新しいデッキ作成" onPress={createDeck} />
      {changeDeckNameButton(localDeckId)}
      {cardGroupPicker(localDeckId, onLocalDeckPickerValueChanged, localDecks)}
      {cardGroupFlatList(localDeckId, tempCardIds, renderLocalDeckItem)}
      {deckDeleteButton(localDeckId)}
      <StatusBar style="auto" />
    </View>
  );
}

type EditDeckScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditDeck"
>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
