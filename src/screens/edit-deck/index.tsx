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
  const [groupId, setGroupId] = useState<number | undefined>(undefined);
  const [deckId, setDeckId] = useState<number | undefined>(undefined);
  const [tempDeck, setTempDeck] = useState<Deck | undefined>(undefined);
  const [decks, setDecks] = useState<Deck[]>([]);
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
      setDecks(loadedDecks);
      console.log(decks);
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
  type GroupCardItem = {
    id: number;
    name: string;
    back: ImageProps;
    cardIds: number[];
  };
  type abstractCardItem = GroupCardItem | Deck;
  // TODO import groups, cards and decks from database
  // TODO デッキ作成後にグループが変更されたときの処理
  const groups: GroupCardItem[] = [
    {
      id: 1,
      name: "トランプ",
      back: require("../../../assets/default/back/card_back.png"),
      cardIds: [1, 2, 1, 1, 1, 1, 1],
    },
    {
      id: 2,
      name: "トランプ2",
      back: require("../../../assets/default/back/card_back.png"),
      cardIds: [3, 4],
    },
  ];
  const cards: { id: number; face: ImageProps; groupId: number }[] = [
    {
      id: 1,
      face: require("../../../assets/default/face/card_club_01.png"),
      groupId: 1,
    },
    {
      id: 2,
      face: require("../../../assets/default/face/card_club_02.png"),
      groupId: 1,
    },
    {
      id: 3,
      face: require("../../../assets/default/face/card_club_03.png"),
      groupId: 2,
    },
    {
      id: 4,
      face: require("../../../assets/default/face/card_club_04.png"),
      groupId: 2,
    },
  ];
  const renderGroupItem = ({ item }: { item: renderedCard }) => {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    const onSwipeDown = () => {
      if (tempDeck != null && deckId != null) {
        console.log(item.cardId);
        const copyTempDeckCardIds = Array.from(tempDeck.cardIds);
        copyTempDeckCardIds.push(item.cardId);
        const deckRepository = getRepository(Deck);
        deckRepository
          .update({ id: deckId }, { cardIds: copyTempDeckCardIds })
          .then(() => {
            setTempDeck(tempDeck);
          });
      }
    };
    return (
      <GestureRecognizer onSwipeDown={() => onSwipeDown()} config={config}>
        <Card faceUrl={item.faceUrl} backUrl={item.backUrl} />
      </GestureRecognizer>
    );
  };
  const renderDeckItem = ({ item }: { item: renderedCard }) => {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    const onSwipeUp = () => {
      if (tempDeck != null) {
        console.log(item.cardId);
        const copyTempDeckCardIds = Array.from(tempDeck.cardIds);
        const index = copyTempDeckCardIds.findIndex((id) => id == item.cardId);
        copyTempDeckCardIds.splice(index, 1);
        // setTempDeckCardIds(copyTempDeckCardIds);
      }
    };
    return (
      <GestureRecognizer onSwipeUp={() => onSwipeUp()} config={config}>
        <Card faceUrl={item.faceUrl} backUrl={item.backUrl} />
      </GestureRecognizer>
    );
  };
  const onGroupPickerValueChanged = (itemValue: React.ReactText) => {
    const selectedGroupId = parseInt(itemValue.toString());
    // 2回呼ばれる対策
    if (selectedGroupId === groupId) {
      return;
    }
    if (Number.isNaN(selectedGroupId)) {
      setGroupId(undefined);
    } else {
      setGroupId(selectedGroupId);
    }
  };
  const onDeckPickerValueChanged = (itemValue: React.ReactText) => {
    const selectedDeckId = parseInt(itemValue.toString());
    // 2回呼ばれる対策
    if (selectedDeckId === deckId) {
      return;
    }
    if (Number.isNaN(selectedDeckId)) {
      setDeckId(undefined);
    } else {
      // TODO デッキの保存 再描画されるのでDB必須
      if (deckId != null && tempDeck != null) {
        const nowDeckCards = decks.filter((deck) => deck.id == deckId)[0];
        nowDeckCards.cardIds = Array.from(tempDeck.cardIds);
        console.log(decks);
        setDeckId(selectedDeckId);
        const deckCards = decks.filter((deck) => deck.id == selectedDeckId)[0];
        // setTempDeck(Array.from(deckCards.cardIds));
      } else {
        setDeckId(selectedDeckId);
        const deckCards = decks.filter((deck) => deck.id == selectedDeckId)[0];
        // setTempDeckCardIds(Array.from(deckCards.cardIds));
      }
    }
  };
  const cardGroupPicker = (
    selectedId: number | undefined,
    onPickerValueChanged: (
      itemValue: React.ReactText,
      itemIndex: number
    ) => void,
    pickerItems: abstractCardItem[]
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
              key={pickerItem.name}
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
    flatListItems: abstractCardItem[],
    renderItem: ({ item }: { item: renderedCard }) => JSX.Element
  ) => {
    if (selectedId == null) {
      return <Text>選択してください</Text>;
    } else {
      const selectedItem = flatListItems.filter(
        (pickerItem) => pickerItem.id == selectedId
      )[0];
      if (selectedItem != null && !(selectedItem instanceof Deck)) {
        const cardData: renderedCard[] = selectedItem.cardIds.map(
          (itemId, index) => {
            const selectedCard = cards.filter((card) => card.id == itemId)[0];
            return {
              id: index,
              cardId: selectedCard.id,
              faceUrl: selectedCard.face,
              backUrl: selectedItem.back,
            };
          }
        );
        return (
          <React.Fragment>
            {selectedId != null && (
              <FlatList
                data={cardData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
              ></FlatList>
            )}
          </React.Fragment>
        );
      } else {
        const cardData: renderedCard[] =
          tempDeck?.cardIds.map((itemId, index) => {
            const selectedCard = cards.filter((card) => card.id == itemId)[0];
            const cardGroup = groups.filter(
              (group) => group.id == selectedCard.groupId
            )[0];
            return {
              id: index,
              cardId: selectedCard.id,
              faceUrl: selectedCard.face,
              backUrl: cardGroup.back,
            };
          }) || [];
        return (
          <React.Fragment>
            {selectedId != null && (
              <FlatList
                data={cardData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
              ></FlatList>
            )}
          </React.Fragment>
        );
      }
    }
  };
  const deckDeleteButton = (deleteDeckId: number | undefined) => {
    if (deleteDeckId != null) {
      return <Button title="デッキ削除" onPress={deleteDeck} />;
    }
  };
  const deleteDeck = () => {
    const deckRepository = getRepository(Deck);
    deckRepository.delete({ id: deckId }).then(() => {
      const copyDecks = Array.from(decks);
      const index = copyDecks.findIndex((deck) => deck.id == deckId);
      copyDecks.splice(index, 1);
      setDecks(copyDecks);
      setDeckId(undefined);
      setTempDeck(undefined);
    });
  };
  const createDeck = () => {
    const newDeck = new Deck();
    newDeck.name = "新しいデッキ";
    newDeck.cardIds = [];
    const deckRepository = getRepository(Deck);
    deckRepository.save(newDeck).then((deck) => {
      const copyDecks = Array.from(decks);
      copyDecks.push(newDeck);
      setDecks(copyDecks);
      setDeckId(deck.id);
      setTempDeck(newDeck);
    });
  };
  return (
    <View style={styles.container}>
      <Button
        title="デッキ編集完了"
        onPress={() => navigation.navigate("Home")}
      />
      <Text>カード一覧</Text>
      {cardGroupPicker(groupId, onGroupPickerValueChanged, groups)}
      {cardGroupFlatList(groupId, groups, renderGroupItem)}
      <Text>デッキ</Text>
      <Button title="新しいデッキ作成" onPress={createDeck} />
      {cardGroupPicker(deckId, onDeckPickerValueChanged, decks)}
      {cardGroupFlatList(deckId, decks, renderDeckItem)}
      {deckDeleteButton(deckId)}
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
