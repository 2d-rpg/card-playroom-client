import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
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
  const [groupSelected, setGroupSelected] = useState(false);
  const [groupId, setGroupId] = useState(1);
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
      cardIds: [1, 2],
    },
    {
      id: 2,
      name: "トランプ2",
      back: require("../../../assets/default/back/card_back.png"),
      cardIds: [3, 4],
    },
  ];
  const cards: { id: number; face: ImageProps }[] = [
    {
      id: 1,
      face: require("../../../assets/default/face/card_club_01.png"),
    },
    {
      id: 2,
      face: require("../../../assets/default/face/card_club_02.png"),
    },
    {
      id: 3,
      face: require("../../../assets/default/face/card_club_03.png"),
    },
    {
      id: 4,
      face: require("../../../assets/default/face/card_club_04.png"),
    },
  ];
  const decks: { id: number; name: string; cards: number[] }[] = [
    {
      id: 1,
      name: "デフォルト(トランプ)",
      cards: [1, 2, 3, 4, 4],
    },
  ];
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
        onValueChange={(itemValue, itemIndex) => {
          const selectedId = parseInt(itemValue.toString());
          if (Number.isNaN(selectedId)) {
            setGroupId(1);
          } else {
            setGroupId(selectedId);
          }
        }}
      >
        {groups.map((group, index) => {
          return (
            <Picker.Item key={index} label={group.name} value={group.id} />
          );
        })}
      </Picker>
      {groups
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
        })}
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
