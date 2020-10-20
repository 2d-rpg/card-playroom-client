import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  FlatList,
  PanResponderGestureState,
} from "react-native";
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
  const [groupId, setGroupId] = useState(1);
  const [deckId, setDeckId] = useState(1);
  const [deckCardList, setDeckCardList] = useState([]);
  // TODO import groups, cards and decks from database
  const groups: {
    id: number;
    name: string;
    back: ImageProps;
    cardIds: number[];
  }[] = [
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
  const decks: { id: number; name: string; cardIds: number[] }[] = [
    {
      id: 1,
      name: "デフォルト(トランプ)",
      cardIds: [1, 2, 3, 4],
    },
  ];

  const selectedGroup = groups.filter((group) => group.id == groupId)[0];
  const groupCards: renderedCard[] = selectedGroup.cardIds.map(
    (cardId, index) => {
      const selectedCard = cards.filter((card) => card.id == cardId)[0];
      return {
        id: index,
        cardId: selectedCard.id,
        faceUrl: selectedCard.face,
        backUrl: selectedGroup.back,
      };
    }
  );
  const selectedDeck = decks.filter((deck) => deck.id == deckId)[0];
  const deckCards: renderedCard[] = selectedDeck.cardIds.map(
    (cardId, index) => {
      const selectedCard = cards.filter((card) => card.id == cardId)[0];
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

  const renderGroupItem = ({ item }: { item: renderedCard }) => {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    const onSwipeDown = () => {
      console.log(selectedDeck.cardIds);
      selectedDeck.cardIds.push(item.cardId);
      console.log(selectedDeck.cardIds);
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
    const onSwipeDown = () => {
      console.log(item.cardId);
    };
    return (
      <GestureRecognizer onSwipeDown={() => onSwipeDown()} config={config}>
        <Card faceUrl={item.faceUrl} backUrl={item.backUrl} />
      </GestureRecognizer>
    );
  };

  type renderedCard = {
    id: number;
    cardId: number;
    faceUrl: ImageProps;
    backUrl: ImageProps;
  };

  type abstractCardGroup =
    | {
        id: number;
        name: string;
        back: ImageProps;
        cardIds: number[];
      }
    | {
        id: number;
        name: string;
        cardIds: number[];
      };

  const pickerAndFlatList = (
    selectedId: number,
    pickerItems: abstractCardGroup[],
    cardData: renderedCard[],
    renderItem: ({ item }: { item: renderedCard }) => JSX.Element
  ) => {
    return (
      <React.Fragment>
        <Picker
          selectedValue={selectedId}
          style={{ height: 50, width: 200 }}
          onValueChange={(itemValue) => {
            const selectedGroupId = parseInt(itemValue.toString());
            if (Number.isNaN(selectedGroupId)) {
              setGroupId(1);
            } else {
              setGroupId(selectedGroupId);
            }
          }}
        >
          {pickerItems.map((pickerItem, index) => {
            return (
              <Picker.Item
                key={index}
                label={pickerItem.name}
                value={pickerItem.id}
              />
            );
          })}
        </Picker>
        <FlatList
          data={cardData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
        ></FlatList>
      </React.Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title="デッキ編集完了"
        onPress={() => navigation.navigate("Home")}
      />
      {pickerAndFlatList(groupId, groups, groupCards, renderGroupItem)}
      {pickerAndFlatList(deckId, decks, deckCards, renderDeckItem)}
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
