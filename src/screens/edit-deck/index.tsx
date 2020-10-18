import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState } from "react";
import { StyleSheet, View, Text, Button, FlatList } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import Card from "../../components/Card";
import { Picker } from "@react-native-community/picker";
import { ImageProps } from "react-native";

export default function EditDeckScreen({
  navigation,
}: {
  navigation: EditDeckScreenNavigationProp;
}): ReactElement {
  const [groupId, setGroupId] = useState(1);
  const [deckId, setDeckId] = useState(1);
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
  // const renderItem = (item: {
  //   id: number;
  //   faceUrl: ImageProps;
  //   backUrl: ImageProps;
  // }) => <Card faceUrl={item.faceUrl} backUrl={item.backUrl} />;
  const renderItem = ({
    item,
  }: {
    item: { id: number; faceUrl: ImageProps; backUrl: ImageProps };
  }) => {
    return <Card faceUrl={item.faceUrl} backUrl={item.backUrl} />;
  };
  const selectedGroup = groups.filter((group) => group.id == groupId)[0];
  const groupCards = selectedGroup.cardIds.map((cardId, index) => {
    const selectedCard = cards.filter((card) => card.id == cardId)[0];
    return {
      id: index,
      faceUrl: selectedCard.face,
      backUrl: selectedGroup.back,
    };
  });
  const selectedDeck = decks.filter((deck) => deck.id == deckId)[0];
  const deckCards = selectedDeck.cardIds.map((cardId, index) => {
    const selectedCard = cards.filter((card) => card.id == cardId)[0];
    const cardGroup = groups.filter(
      (group) => group.id == selectedCard.groupId
    )[0];
    return {
      id: index,
      faceUrl: selectedCard.face,
      backUrl: cardGroup.back,
    };
  });
  return (
    <View style={styles.container}>
      <Text>Edit Deck Screen</Text>
      <Button
        title="ホーム画面に戻る"
        onPress={() => navigation.navigate("Home")}
      />
      <Picker
        selectedValue={groupId}
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
        {groups.map((group, index) => {
          return (
            <Picker.Item key={index} label={group.name} value={group.id} />
          );
        })}
      </Picker>
      <FlatList
        data={groupCards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
      ></FlatList>
      <Picker
        selectedValue={deckId}
        style={{ height: 50, width: 200 }}
        onValueChange={(itemValue) => {
          const selectedDeckId = parseInt(itemValue.toString());
          if (Number.isNaN(selectedDeckId)) {
            setDeckId(1);
          } else {
            setDeckId(selectedDeckId);
          }
        }}
      >
        {decks.map((deck, index) => {
          return <Picker.Item key={index} label={deck.name} value={deck.id} />;
        })}
      </Picker>
      <FlatList
        data={deckCards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
      ></FlatList>
      {/* {groups
        .filter((group) => group.id == groupId)
        .map((filterdGroup) => {
          const back = filterdGroup.back;
          const groupCards = filterdGroup.cardIds.map((cardId) => {
            const filteredCards = cards.filter((card) => card.id == cardId);
            return filteredCards[0];
          });
          const cardsView = groupCards.map((card, index) => {
            return <Card key={index} faceUrl={card.face} backUrl={back} />;
          });
          return cardsView;
        })} */}
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
