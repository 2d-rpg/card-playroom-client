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
  getConnection,
} from "typeorm/browser";
import { Deck } from "../../entities/Deck";
import { NativeSyntheticEvent } from "react-native";
import { NativeTouchEvent } from "react-native";

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
      console.log(connectionManager.connections.length);
      if (connectionManager.connections.length == 0) {
        await connect();
      }
      const deckRepository = getRepository(Deck);
      // await deckRepository.clear();
      const loadedDecks = await deckRepository.find();
      console.log(loadedDecks);
      setLocalDecks(loadedDecks);
      console.log(localDecks);
      // console.log();
      // await connect();
      // console.log(connectionManager.get());
      // const deck1 = new Deck();
      // deck1.name = "新しいデッキ";
      // deck1.cardIds = [];
      // const deckRepository = getRepository(Deck);
      // await deckRepository.clear();
      // await deckRepository.save(deck1);
      // console.log("Deck has been saved");
      // const loadedDecks = await deckRepository.find({
      //   where: { id: deck1.id },
      // });
      // console.log("Deck has been loaded", loadedDecks);
    }
    loadDecks();
  }, []);
  type renderedCard = {
    id: number;
    cardId: number;
    faceUrl: ImageProps;
    backUrl: ImageProps;
  };

  // TODO import groups, cards and decks from database
  // TODO デッキ作成後にグループが変更されたときの処理
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
  const renderServerDeckItem = ({ item }: { item: renderedCard }) => {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    const onSwipeDown = () => {
      if (tempCardIds != null && localDeckId != null) {
        console.log(item.cardId);
        const copyTempDeckCardIds = [...tempCardIds, item.cardId];
        setTempCardIds(copyTempDeckCardIds);
        // const deckRepository = getRepository(Deck);
        // deckRepository
        //   .update({ id: localDeckId }, { cardIds: copyTempDeckCardIds })
        //   .then(() => {
        //     setTempDeck(tempDeck);
        //   });
      }
    };
    return (
      <GestureRecognizer onSwipeDown={() => onSwipeDown()} config={config}>
        <Card faceUrl={item.faceUrl} backUrl={item.backUrl} />
      </GestureRecognizer>
    );
  };
  const renderLocalDeckItem = ({ item }: { item: renderedCard }) => {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    const onSwipeUp = () => {
      if (tempCardIds != null) {
        console.log(item.cardId);
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
  const onDeckPickerValueChanged = async (itemValue: React.ReactText) => {
    const selectedDeckId = parseInt(itemValue.toString());
    // 2回呼ばれる対策
    console.log(selectedDeckId, localDeckId);
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
  const deckDeleteButton = (deleteDeckId: number | undefined) => {
    if (deleteDeckId != null) {
      return <Button title="デッキ削除" onPress={deleteDeck} />;
    }
  };
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

  const changeDeckNameButton = (deckId: number | undefined) => {
    if (deckId != null) {
      return <Button title="デッキ名変更" onPress={changeDeckName} />;
    }
  };
  const changeDeckName = async () => {
    const deckId = localDeckId;
  };

  return (
    <View style={styles.container}>
      <Button
        title="デッキ編集完了"
        onPress={() => navigation.navigate("Home")}
      />
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
      {cardGroupPicker(localDeckId, onDeckPickerValueChanged, localDecks)}
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
