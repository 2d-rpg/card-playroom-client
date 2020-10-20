import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState } from "react";
import { StyleSheet, View, Text, Button, FlatList } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import Card from "../../components/Card";
import { Picker } from "@react-native-community/picker";
import { ImageProps } from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";

export default function EditDeckScreen({
  navigation,
}: {
  navigation: EditDeckScreenNavigationProp;
}): ReactElement {
  const [groupId, setGroupId] = useState<number | undefined>(undefined);
  const [deckId, setDeckId] = useState<number | undefined>(undefined);
  const [tempDeckCardIds, setTempDeckCardIds] = useState<number[]>([]);
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
  type DeckCardItem = {
    id: number;
    name: string;
    cardIds: number[];
  };
  type abstractCardItem = GroupCardItem | DeckCardItem;
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
  const decks: DeckCardItem[] = [
    {
      id: 1,
      name: "デフォルト(トランプ)",
      cardIds: [1, 2, 3, 4],
    },
    {
      id: 2,
      name: "デフォルト2(トランプ)",
      cardIds: [1],
    },
  ];
  const renderGroupItem = ({ item }: { item: renderedCard }) => {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    const onSwipeDown = () => {
      console.log(item.cardId);
      const copyTempDeckCardIds = Array.from(tempDeckCardIds);
      copyTempDeckCardIds.push(item.cardId);
      setTempDeckCardIds(copyTempDeckCardIds);
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
      console.log(item.cardId);
      const copyTempDeckCardIds = Array.from(tempDeckCardIds);
      const index = copyTempDeckCardIds.findIndex((id) => id == item.cardId);
      copyTempDeckCardIds.splice(index, 1);
      setTempDeckCardIds(copyTempDeckCardIds);
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
      if (deckId != null && tempDeckCardIds != null) {
        const nowDeckCards = decks.filter((deck) => deck.id == deckId)[0];
        nowDeckCards.cardIds = Array.from(tempDeckCardIds);
        console.log(decks);
        setDeckId(selectedDeckId);
        const deckCards = decks.filter((deck) => deck.id == selectedDeckId)[0];
        setTempDeckCardIds(Array.from(deckCards.cardIds));
      } else {
        setDeckId(selectedDeckId);
        const deckCards = decks.filter((deck) => deck.id == selectedDeckId)[0];
        setTempDeckCardIds(Array.from(deckCards.cardIds));
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
        {pickerItems.map((pickerItem, index) => {
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
      if ("back" in selectedItem) {
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
        const cardData: renderedCard[] = tempDeckCardIds.map(
          (itemId, index) => {
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
      }
    }
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
      {cardGroupPicker(deckId, onDeckPickerValueChanged, decks)}
      {cardGroupFlatList(deckId, decks, renderDeckItem)}
      <StatusBar style="auto" />
    </View>
  );
  // これでもhogeは2回呼ばれる
  // const [state, setState] = useState("java");
  // return (
  //   <Picker
  //     selectedValue={state}
  //     style={{ height: 50, width: 200 }}
  //     onValueChange={(itemValue, itemIndex) => {
  //       console.log("hoge");
  //       setState(itemValue.toString());
  //     }}
  //   >
  //     <Picker.Item label="Java" value="java" />
  //     <Picker.Item label="JavaScript" value="js" />
  //   </Picker>
  // );
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
