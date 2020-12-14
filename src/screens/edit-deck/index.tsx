import { StatusBar } from "expo-status-bar";
import React, { ReactElement, useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, FlatList } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import Card from "../../components/Card";
import { Picker } from "@react-native-community/picker";
import GestureRecognizer from "react-native-swipe-gestures";
import {
  createConnection,
  getRepository,
  getConnectionManager,
} from "typeorm/browser";
import { Deck } from "../../entities/Deck";
import Dialog from "react-native-dialog";
import { gql, useQuery } from "@apollo/client";

const CARDS_QUERY = gql`
  query {
    cards {
      id
      face
      back
    }
  }
`;

const DECKS_QUERY = gql`
  query {
    decksWithCards {
      id
      name
      cardIds
    }
  }
`;

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
  const decksQueryResult = useQuery(DECKS_QUERY);
  const cardsQueryResult = useQuery(CARDS_QUERY);
  const [serverDecks, setServerDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<
    {
      id: number;
      face: string;
      back: string;
    }[]
  >([]);

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
  // カードをサーバーからロード
  useEffect(() => {
    if (cardsQueryResult != null && !cardsQueryResult.loading) {
      if (cardsQueryResult.error == null) {
        const serverCards: {
          id: number;
          face: string;
          back: string;
        }[] = cardsQueryResult.data.cards;
        setCards(serverCards);
      }
    }
  }, [cardsQueryResult]);
  // デッキをサーバーからロード
  useEffect(() => {
    if (decksQueryResult != null && !decksQueryResult.loading) {
      if (decksQueryResult.error == null) {
        const serverDecks: Deck[] = decksQueryResult.data.decksWithCards;
        setServerDecks(serverDecks);
      }
    }
  }, [decksQueryResult]);

  if (
    cardsQueryResult == null ||
    cardsQueryResult.loading ||
    decksQueryResult == null ||
    decksQueryResult.loading
  ) {
    // TODO ローディング中処理を豪華にする
    return (
      <View style={styles.container}>
        <Text>ローディング中</Text>
      </View>
    );
  } else if (cardsQueryResult.error != null || decksQueryResult.error != null) {
    // TODO エラー処理を豪華にする
    return (
      <View style={styles.container}>
        <Text>ローディングエラー: IPアドレスの設定を確認してください</Text>
      </View>
    );
  } else {
    // 表示カードの型
    type renderedCard = {
      id: number;
      cardId: number;
      facePath: string;
      backPath: string;
    };

    // サーバーのデッキのカードの描画
    const renderServerDeckItem = ({ item }: { item: renderedCard }) => {
      const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
      };
      // TODO 裏面表示(上スワイプ?)
      // TODO 拡大表示(長押し？)
      // TODO アニメーション
      // TODO カード追加時に追加したカードをフォーカスする
      // 下スワイプでローカルのデッキにカードを追加
      const onSwipeDown = () => {
        if (tempCardIds != null && localDeckId != null) {
          const copyTempDeckCardIds = [...tempCardIds, item.cardId].sort();
          setTempCardIds(copyTempDeckCardIds);
        }
      };
      return (
        <GestureRecognizer onSwipeDown={() => onSwipeDown()} config={config}>
          <Card facePath={item.facePath} backPath={item.backPath} />
        </GestureRecognizer>
      );
    };

    // ローカルのデッキのカードの描画
    // TODO 同じカードの描画の際カード下に枚数を表示
    const renderLocalDeckItem = ({ item }: { item: renderedCard }) => {
      const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
      };
      // TODO 裏面表示(上スワイプ?)
      // TODO 拡大表示(長押し？)
      // TODO アニメーション
      // 上スワイプでローカルのデッキからカードを削除
      const onSwipeUp = () => {
        if (tempCardIds != null) {
          const copyTempDeckCardIds = Array.from(tempCardIds);
          const index = copyTempDeckCardIds.findIndex(
            (id) => id == item.cardId
          );
          copyTempDeckCardIds.splice(index, 1);
          setTempCardIds(copyTempDeckCardIds);
        }
      };
      return (
        <GestureRecognizer onSwipeUp={() => onSwipeUp()} config={config}>
          <Card facePath={item.facePath} backPath={item.backPath} />
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
      if (Number.isNaN(selectedGroupId) && serverDeckId == null) {
        return;
      }
      if (Number.isNaN(selectedGroupId)) {
        // TODO なぜか選択がリセットされるので暫定的に対処．ローカルのデッキ選択処理は問題ない？
        // setServerDeckId(undefined);
        // setServerDeckCardIds([]);
      } else {
        setServerDeckId(selectedGroupId);
        const selectedDeck = serverDecks.filter(
          (serverDeck) => serverDeck.id == selectedGroupId
        )[0];
        setServerDeckCardIds(selectedDeck.cardIds);
      }
    };

    // ローカルのデッキ選択処理
    const onLocalDeckPickerValueChanged = async (
      itemValue: React.ReactText
    ) => {
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
          style={styles.picker}
          onValueChange={onPickerValueChanged}
        >
          <Picker.Item key="none" label="選択なし" value="none" />
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
            facePath: selectedCard.face,
            backPath: selectedCard.back,
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
        await deckRepository.update(
          { id: localDeckId },
          { name: tempDeckName }
        );
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
        {cardGroupFlatList(
          serverDeckId,
          serverDeckCardIds,
          renderServerDeckItem
        )}
        <Text>デッキ</Text>
        <Button title="新しいデッキ作成" onPress={createDeck} />
        {changeDeckNameButton(localDeckId)}
        {cardGroupPicker(
          localDeckId,
          onLocalDeckPickerValueChanged,
          localDecks
        )}
        {cardGroupFlatList(localDeckId, tempCardIds, renderLocalDeckItem)}
        {deckDeleteButton(localDeckId)}
        <StatusBar style="auto" />
      </View>
    );
  }
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
  picker: { width: 200 },
});
