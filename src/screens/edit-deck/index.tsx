import React, { ReactElement, useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View, FlatList } from "react-native";
import Card from "../../components/Card";
import { Picker } from "@react-native-picker/picker";
import GestureRecognizer from "react-native-swipe-gestures";
import {
  createConnection,
  getRepository,
  getConnectionManager,
} from "typeorm/browser";
import { Deck } from "../../entities/Deck";
import Dialog from "react-native-dialog";
import { gql, useQuery } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { FloatingAction } from "react-native-floating-action";
import { Icon, Text } from "react-native-elements";

interface ServerCard {
  id: number;
  face: string;
  back: string;
}

interface ServerCards {
  cards: ServerCard[];
}

const GET_SERVER_CARDS = gql`
  query {
    cards {
      id
      face
      back
    }
  }
`;

interface ServerDecks {
  decksWithCards: Deck[];
}
const GET_SERVER_DECKS = gql`
  query {
    decksWithCards {
      id
      name
      cardIds
    }
  }
`;

const windowHeight = Dimensions.get("window").height;
const cardHeight = windowHeight / 3;
const cardWidth = (cardHeight * 2) / 3;
const flatListHeight = cardHeight + 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: { width: 200 },
  flatList: {
    height: flatListHeight,
    width: Dimensions.get("window").width,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default function EditDeckScreen(): ReactElement {
  const [serverDeckId, setServerDeckId] = useState<string | undefined>(
    undefined
  );
  const [serverDecks, setServerDecks] = useState<Deck[]>([]);
  const [serverDeckCardIds, setServerDeckCardIds] = useState<number[]>([]);

  const [localDeckId, setLocalDeckId] = useState<number | undefined>(undefined);
  const [localDecks, setLocalDecks] = useState<Deck[]>([]);
  const [localDeckCardIds, setLocalDeckCardIds] = useState<number[]>([]);

  const [cards, setCards] = useState<ServerCard[]>([]);

  const [
    isVisibleDeckDeleteConfirmDialog,
    setIsVisibleDeckDeleteConfirmDialog,
  ] = useState(false);

  const [
    isVisibleDeckNameChangeDialog,
    setIsVisibleDeckNameChangeDialog,
  ] = useState(false);
  const [deckName, setDeckName] = useState("");

  const decksQueryResult = useQuery<ServerDecks>(GET_SERVER_DECKS);
  const cardsQueryResult = useQuery<ServerCards>(GET_SERVER_CARDS);

  const [reloadCount, setReloadCount] = useState(0);
  const [endpoint, setEndPoint] = useState<string>("127.0.0.1");
  const isFocused = useIsFocused();

  const updateLocalDeck = async (
    deckId: number | undefined,
    cardIds: number[] | undefined
  ) => {
    const deckRepository = getRepository(Deck);
    if (deckId != null && cardIds != null) {
      await deckRepository.update({ id: deckId }, { cardIds: cardIds });
    }
    const loadedDecks = await deckRepository.find();
    setLocalDecks(loadedDecks);
  };

  const reload = () => {
    cardsQueryResult.refetch();
    decksQueryResult.refetch();
    setReloadCount(reloadCount + 1);
  };

  // 最初にローカルに保存されているデッキをロードし，エンドポイントをセット
  useEffect(() => {
    // タブ切り替えでは再レンダリングが行われないのでこのタブがフォーカスされたときにクエリを再度投げる
    if (isFocused) {
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

        const endpointFromPreferences = await AsyncStorage.getItem("@endpoint");
        if (endpointFromPreferences != null) {
          setEndPoint(endpointFromPreferences);
        }
      })();
      if (
        cardsQueryResult != null &&
        !cardsQueryResult.loading &&
        cardsQueryResult.error != null
      ) {
        cardsQueryResult.refetch();
      }
      if (
        decksQueryResult != null &&
        !decksQueryResult.loading &&
        decksQueryResult.error != null
      ) {
        decksQueryResult.refetch();
      }
    }
  }, [isFocused]);

  // カードをサーバーからロード
  useEffect(() => {
    if (cardsQueryResult != null && !cardsQueryResult.loading) {
      if (cardsQueryResult.error == null) {
        const serverCards = cardsQueryResult.data?.cards;
        if (serverCards != null) {
          setCards(serverCards);
        }
      }
    }
  }, [cardsQueryResult, reloadCount]);
  // デッキをサーバーからロード
  useEffect(() => {
    if (decksQueryResult != null && !decksQueryResult.loading) {
      if (decksQueryResult.error == null) {
        const serverDecks = decksQueryResult.data?.decksWithCards;
        if (serverDecks != null) {
          setServerDecks(serverDecks);
        }
      }
    }
  }, [decksQueryResult, reloadCount]);

  // リロード
  useEffect(() => {
    setServerDeckId(undefined);
    setLocalDeckId(undefined);
    setLocalDeckCardIds([]);
  }, [reloadCount]);

  if (
    cardsQueryResult == null ||
    cardsQueryResult.loading ||
    decksQueryResult == null ||
    decksQueryResult.loading
  ) {
    return (
      <View style={styles.container}>
        <Text>ローディング中...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  } else if (cardsQueryResult.error != null || decksQueryResult.error != null) {
    // TODO エラー処理を豪華にする
    if (cardsQueryResult.error != null) {
      console.log(`cardsQueryResult.error: ${cardsQueryResult.error}`);
    }
    if (decksQueryResult.error != null) {
      console.log(`decksQueryResult.error: ${decksQueryResult.error}`);
    }
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
      facePath: string | undefined;
      backPath: string | undefined;
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
      const onSwipeDown = async () => {
        if (localDeckCardIds != null && localDeckId != null) {
          const copyTempDeckCardIds = [...localDeckCardIds, item.cardId].sort();
          setLocalDeckCardIds(copyTempDeckCardIds);
          await updateLocalDeck(localDeckId, copyTempDeckCardIds);
        }
      };
      return (
        <GestureRecognizer onSwipeDown={() => onSwipeDown()} config={config}>
          <Card
            facePath={item.facePath}
            backPath={item.backPath}
            height={cardHeight}
            width={cardWidth}
            endpoint={endpoint}
          />
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
      const onSwipeUp = async () => {
        if (localDeckCardIds != null && localDeckId != null) {
          const copyTempDeckCardIds = Array.from(localDeckCardIds);
          const index = copyTempDeckCardIds.findIndex(
            (id) => id == item.cardId
          );
          copyTempDeckCardIds.splice(index, 1);
          setLocalDeckCardIds(copyTempDeckCardIds);
          await updateLocalDeck(localDeckId, copyTempDeckCardIds);
        }
      };
      return (
        <GestureRecognizer onSwipeUp={() => onSwipeUp()} config={config}>
          <Card
            facePath={item.facePath}
            backPath={item.backPath}
            height={cardHeight}
            width={cardWidth}
            endpoint={endpoint}
          />
        </GestureRecognizer>
      );
    };

    // サーバーのデッキ選択処理
    const onServerDeckPickerValueChanged = (itemValue: React.ReactText) => {
      // * NOTE おそらくApolloの影響でserverDeck.idがstringになり選択してもnoneになってしまっていた
      // * NOTE そのためserverDeckIdの型をstringにして対応し，numberで処理しているローカルのデッキ選択とは異なる
      const selectedServerId = itemValue.toString();
      // 2回呼ばれる対策
      if (selectedServerId === serverDeckId) {
        return;
      }
      if (selectedServerId == "none" && serverDeckId == null) {
        return;
      }
      if (selectedServerId == "none") {
        setServerDeckId(undefined);
        setServerDeckCardIds([]);
      } else {
        setServerDeckId(selectedServerId);
        const selectedDeck = serverDecks.find(
          (serverDeck) => serverDeck.id == parseInt(selectedServerId)
        );
        if (selectedDeck != null) {
          setServerDeckCardIds(selectedDeck.cardIds);
        }
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
      // 編集デッキを変更
      if (Number.isNaN(selectedDeckId)) {
        setLocalDeckId(undefined);
        setLocalDeckCardIds([]);
      } else {
        if (localDeckId != null) {
          setLocalDeckId(selectedDeckId);
          const selectedLocalDeck = localDecks.find(
            (deck) => deck.id == selectedDeckId
          );
          if (selectedLocalDeck != null) {
            setLocalDeckCardIds(selectedLocalDeck.cardIds);
          }
        } else {
          setLocalDeckId(selectedDeckId);
          const selectedLocalDeck = localDecks.find(
            (deck) => deck.id == selectedDeckId
          );
          if (selectedLocalDeck != null) {
            setLocalDeckCardIds(selectedLocalDeck.cardIds);
          }
        }
      }
    };

    // ローカル/サーバー のデッキ選択のためのセレクトボックス
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
    const deckFlatList = (
      selectedId: number | string | undefined,
      cardIds: number[],
      renderItem: ({ item }: { item: renderedCard }) => JSX.Element
    ) => {
      if (selectedId == null) {
        return (
          <FlatList
            style={styles.flatList}
            data={null}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal={true}
          ></FlatList>
        );
      } else {
        let isIncludeNotFound = false;
        const flatListItems = cardIds.map((cardId, index) => {
          const selectedCard = cards.find((card) => card.id == cardId);
          if (selectedCard == null) {
            //* HACK: map()内で他の変数が変化するのは良くない
            isIncludeNotFound = true;
            return {
              id: index,
              cardId: cardId,
              facePath: undefined,
              backPath: undefined,
            };
          } else {
            return {
              id: index,
              cardId: cardId,
              facePath: selectedCard.face,
              backPath: selectedCard.back,
            };
          }
        });
        return (
          <React.Fragment>
            {isIncludeNotFound && (
              <Text>一部のカードの読み込みに失敗しました</Text>
            )}
            <FlatList
              style={styles.flatList}
              data={flatListItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal={true}
            ></FlatList>
          </React.Fragment>
        );
      }
    };

    // デッキ作成
    const createDeck = async () => {
      const deckRepository = getRepository(Deck);
      const newDeck = new Deck();
      newDeck.name = "新しいデッキ";
      newDeck.cardIds = [];
      await deckRepository.save(newDeck).then((deck) => {
        const copyDecks = [...localDecks, deck];
        setLocalDecks(copyDecks);
        setLocalDeckId(deck.id);
        setLocalDeckCardIds(deck.cardIds);
      });
    };

    // デッキ削除
    const deleteDeck = async () => {
      const deleteDeckId = localDeckId;
      setLocalDeckId(undefined);
      setLocalDeckCardIds([]);
      const deckRepository = getRepository(Deck);
      await deckRepository.delete({ id: deleteDeckId }).then(() => {
        const copyDecks = Array.from(localDecks);
        const index = copyDecks.findIndex((deck) => deck.id == deleteDeckId);
        copyDecks.splice(index, 1);
        setLocalDecks(copyDecks);
      });
    };
    const showDeckDeleteConfirmDialog = () => {
      setIsVisibleDeckDeleteConfirmDialog(true);
    };
    const deckDeleteConfirmDialog = () => {
      const selectedDeck = localDecks.find(
        (localDeck) => localDeck.id == localDeckId
      );
      if (selectedDeck != null) {
        return (
          <Dialog.Container visible={isVisibleDeckDeleteConfirmDialog}>
            <Dialog.Title>{`${selectedDeck.name}を削除しますか？`}</Dialog.Title>
            <Dialog.Button
              label="キャンセル"
              onPress={() => setIsVisibleDeckDeleteConfirmDialog(false)}
            />
            <Dialog.Button label="削除" onPress={deleteDeck} />
          </Dialog.Container>
        );
      }
    };

    // デッキ名変更
    const saveDeckName = async () => {
      if (localDeckId != null) {
        const selectedDeck = localDecks.find(
          (localDeck) => localDeck.id == localDeckId
        );
        if (selectedDeck != null) {
          selectedDeck.name = deckName;
          setLocalDecks(localDecks);
          const deckRepository = getRepository(Deck);
          await deckRepository.update({ id: localDeckId }, { name: deckName });
        }
      }
      setIsVisibleDeckNameChangeDialog(false);
    };
    const showDeckNameChangeDialog = () => {
      const selectedDeck = localDecks.find(
        (localDeck) => localDeck.id == localDeckId
      );
      if (selectedDeck != null) {
        setDeckName(selectedDeck.name);
      }
      setIsVisibleDeckNameChangeDialog(true);
    };
    const deckNameChangeDialog = () => {
      const selectedDeck = localDecks.find(
        (localDeck) => localDeck.id == localDeckId
      );
      if (selectedDeck != null) {
        return (
          <Dialog.Container visible={isVisibleDeckNameChangeDialog}>
            <Dialog.Title>デッキ名変更</Dialog.Title>
            <Dialog.Input
              label="デッキ名"
              onChangeText={(name: string) => setDeckName(name)}
            >
              {selectedDeck.name}
            </Dialog.Input>
            <Dialog.Button
              label="キャンセル"
              onPress={() => setIsVisibleDeckNameChangeDialog(false)}
            />
            <Dialog.Button label="保存" onPress={saveDeckName} />
          </Dialog.Container>
        );
      }
    };

    const floadtingActions =
      localDeckId == null
        ? [
            {
              text: "更新",
              icon: <Icon color="#FFFFFF" type="antdesign" name="reload1" />,
              name: "reload",
              position: 1,
            },
            {
              text: "デッキ作成",
              icon: <Icon color="#FFFFFF" name="add" />,
              name: "addDeck",
              position: 2,
            },
          ]
        : [
            {
              text: "デッキ削除",
              icon: <Icon color="#FFFFFF" name="delete" />,
              name: "deleteDeck",
              position: 1,
            },
            {
              text: "デッキ名変更",
              icon: <Icon color="#FFFFFF" name="edit" />,
              name: "renameDeck",
              position: 2,
            },
            {
              text: "更新",
              icon: <Icon color="#FFFFFF" type="antdesign" name="reload1" />,
              name: "reload",
              position: 3,
            },
            {
              text: "デッキ作成",
              icon: <Icon color="#FFFFFF" name="add" />,
              name: "addDeck",
              position: 4,
            },
          ];
    const onPressFloadtingActionIcons = (name: string | undefined) => {
      switch (name) {
        case "reload":
          reload();
          break;
        case "addDeck":
          createDeck();
          break;
        case "renameDeck":
          showDeckNameChangeDialog();
          break;
        case "deleteDeck":
          showDeckDeleteConfirmDialog();
          break;
      }
    };

    return (
      <View style={styles.container}>
        <Text>サーバーのデッキ</Text>
        {deckPicker(serverDeckId, onServerDeckPickerValueChanged, serverDecks)}
        {deckFlatList(serverDeckId, serverDeckCardIds, renderServerDeckItem)}
        <Text>ローカルのデッキ</Text>
        {deckPicker(localDeckId, onLocalDeckPickerValueChanged, localDecks)}
        {deckFlatList(localDeckId, localDeckCardIds, renderLocalDeckItem)}
        <FloatingAction
          actions={floadtingActions}
          color={"#03A9F4"}
          onPressItem={onPressFloadtingActionIcons}
        />
        {deckNameChangeDialog()}
        {deckDeleteConfirmDialog()}
      </View>
    );
  }
}
