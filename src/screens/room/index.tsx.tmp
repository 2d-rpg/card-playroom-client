import React, { ReactElement, useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
// import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { gql, useQuery } from "@apollo/client";
import { MovableCard } from "../../components/MovableCard";
import {
  ServerCard,
  ServerCards,
  CardInRoom,
} from "../../utils/server-card-interface";
import { useValueRef } from "../../utils/use-value-ref";
import {
  isCardsInfoMessage,
  isSomeoneEnterRoomMessage,
  WsMessage,
} from "../../utils/ws-message";

// TODO カードを必要な分だけ取る
const GET_SERVER_CARDS = gql`
  query {
    cards {
      id
      face
      back
    }
  }
`;

const windowHeight = Dimensions.get("window").height;
const cardHeight = windowHeight / 3;
const cardWidth = (cardHeight * 2) / 3;

export default function RoomScreen({
  route,
}: {
  route: RoomScreenRouteProp;
}): ReactElement {
  const { roomid, endpoint, cardIds } = route.params;
  const websocket = useRef<WebSocket | null>(null);
  const cardsQueryResult = useQuery<ServerCards>(GET_SERVER_CARDS);
  const [ownCards, setOwnCards] = useState<CardInRoom[]>([]);
  const refOwnCards = useValueRef(ownCards);
  const [opponentCards, setOpponentCards] = useState<CardInRoom[]>([]);
  const refOpponentCards = useValueRef(opponentCards);
  const [ownPan, setOwnPan] = useState(new Animated.ValueXY());
  const [opponentPan, setOpponentPan] = useState(new Animated.ValueXY());

  // カードをサーバーからロード
  useEffect(() => {
    if (cardsQueryResult != null && !cardsQueryResult.loading) {
      if (cardsQueryResult.error == null) {
        const serverCards = cardsQueryResult.data?.cards;
        if (serverCards != null) {
          const ownCardsLength = cardIds.length;
          const ownCardsInRoom = cardIds.map((cardId, index) => {
            const serverCard = serverCards.find((card) => card.id === cardId);
            if (serverCard != null) {
              const cardInRoom: CardInRoom = {
                // *HACK: おそらくApolloの影響でcardIdがStringとして解釈されるのでNumberにキャスト
                id: Number(cardId),
                face: serverCard.face,
                back: serverCard.back,
                index: index,
                own: true,
                position: new Animated.ValueXY({
                  x: 0,
                  y: -cardHeight * index + (ownCardsLength * cardHeight) / 2,
                }),
                initx: 0,
                inity: -cardHeight * index + (ownCardsLength * cardHeight) / 2,
              };
              return cardInRoom;
            } else {
              // サーバーに指定されたIDのカードがない場合
              const unloadCard: CardInRoom = {
                // *HACK: おそらくApolloの影響でcardIdがStringとして解釈されるのでNumberにキャスト
                id: Number(cardId),
                face: undefined,
                back: undefined,
                index: index,
                own: true,
                position: new Animated.ValueXY(),
                initx: 0,
                inity: -cardHeight * index + (ownCardsLength * cardHeight) / 2,
              };
              return unloadCard;
            }
          });
          setOwnCards(ownCardsInRoom);
        }
      }
    }
  }, [cardsQueryResult]);

  useEffect(() => {
    if (
      ownCards.length !== 0 &&
      websocket.current != null &&
      websocket.current.readyState === WebSocket.OPEN
    ) {
      const cardsInfo = ownCards.map((ownCard) => {
        return {
          id: ownCard.id,
          face: ownCard.face,
          back: ownCard.back,
          index: ownCard.index,
          own: !ownCard.own,
          position: ownCard.position,
          initx: ownCard.initx,
          inity: ownCard.inity,
        };
      });
      websocket.current.send(`/cards ${JSON.stringify(cardsInfo)}`);
    }
  }, [ownCards, websocket.current]);

  // WebSocket
  useEffect(() => {
    try {
      websocket.current = new WebSocket(`ws://${endpoint}/ws`);
      websocket.current.onopen = () => {
        // ルーム入室
        console.log("websocket opened!");
        websocket.current?.send(`/join ${roomid}`);
      };
      // イベント受け取り
      websocket.current.onmessage = (event) => {
        console.log("received event:" + event.data);
        const json: WsMessage = JSON.parse(event.data);
        if (isCardsInfoMessage(json)) {
          if (json.data.length !== 0 && refOpponentCards.current.length === 0) {
            setOpponentCards(json.data);
          } else if (
            json.data.length === 1 &&
            refOpponentCards.current.length !== 0
          ) {
            const copyOpponentCards = Array.from(refOpponentCards.current);
            const newInfoCard = json.data[0];
            const index = copyOpponentCards.findIndex(
              (card) => card.index === newInfoCard.index
            );
            if (index !== -1) {
              copyOpponentCards.splice(index, 1);
              setOpponentCards([...copyOpponentCards, newInfoCard]);
            }
          }
        } else if (isSomeoneEnterRoomMessage(json)) {
          if (refOwnCards.current != null) {
            const cardsInfo = refOwnCards.current.map((ownCard) => {
              return {
                id: ownCard.id,
                face: ownCard.face,
                back: ownCard.back,
                index: ownCard.index,
                own: !ownCard.own,
                position: ownCard.position,
                initx: ownCard.initx,
                inity: ownCard.inity,
              };
            });
            console.log(typeof cardsInfo[0].id);
            console.log(`SE: ${JSON.stringify(cardsInfo)}`);
            websocket.current?.send(`/cards ${JSON.stringify(cardsInfo)}`);
          }
        }
        // // TODO サーバーからのメッセージの形式を統一する
        // if (event.data.startsWith('{"kind')) {
        //   // TODO サーバ側ですべてjson parsableになるよう実装
        //   const data = JSON.parse(event.data);
        //   if (data.kind === "opponent") {
        //     ownPan.setValue({ x: data.x, y: data.y });
        //   } else {
        //     opponentPan.setValue({ x: data.x, y: data.y });
        //   }
        // } else if (event.data == "Someone connected") {
        //   // TODO 3人以上のとき、2人以上から送られてくることになり、危険
        //   console.log("!!!!!!!!!!!!!OUTSIDE!!!!!!!!!!!!!");
        //   console.log(firstOwnCardRef.current);
        //   if (firstOwnCardRef.current != null) {
        //     console.log("!!!!!!!!!!!!!INSIDE!!!!!!!!!!!!!");
        //     console.log("send Own card info when someone connected!");
        //     websocket.current?.send(JSON.stringify(firstOwnCardRef.current));
        //   }
        // } else if (
        //   event.data.startsWith('{"__typename') ||
        //   event.data.startsWith('{"id')
        // ) {
        //   console.log("receive opponent card info");
        //   const data = JSON.parse(event.data);
        //   setFirstOpponentCard(data);
        // }
      };
    } catch (error) {
      // 設定読み込みエラー
      console.log(error);
    }
    return () => {
      if (websocket.current != null) {
        websocket.current.close();
      }
    };
  }, []);

  const movableCards = (cards: CardInRoom[] | null) => {
    if (cards == null) {
      return <ActivityIndicator />;
    } else {
      const movableCardComponents = cards.map((card) => (
        <MovableCard
          key={card.index}
          face={card.face}
          back={card.back}
          width={cardWidth}
          height={cardHeight}
          endpoint={endpoint}
          onCardRelease={() => {
            card.position.flattenOffset();
            // ポジションをjsonとしてサーバに送信
            if (
              websocket.current != null &&
              websocket.current.readyState == WebSocket.OPEN
            ) {
              console.log(
                `MC: ${JSON.stringify([
                  {
                    index: card.index,
                    own: !card.own,
                    x: card.position.x,
                    y: card.position.y,
                  },
                ])}`
              );
              websocket.current.send(
                `/cards ${JSON.stringify([
                  {
                    // *HACK: おそらくApolloの影響でcardIdがStringとして解釈されるのでNumberにキャスト
                    id: Number(card.id),
                    face: card.face,
                    back: card.back,
                    index: card.index,
                    own: !card.own,
                    position: card.position,
                    initx: card.initx,
                    inity: card.inity,
                  },
                ])}`
              );
            }
          }}
          position={card.position}
          initx={card.initx}
          inity={card.inity}
        />
      ));
      return movableCardComponents;
    }
  };

  // TODO WebSocket接続エラーの対応
  console.log(`OC${JSON.stringify(ownCards)}`);
  console.log(`OCR${JSON.stringify(refOwnCards.current)}`);
  console.log(`OPC${JSON.stringify(opponentCards)}`);
  console.log(`OPCR${JSON.stringify(refOpponentCards.current)}`);
  return (
    <View style={styles.container}>
      {movableCards(ownCards)}
      {movableCards(refOpponentCards.current)}
    </View>
  );
}

type RoomScreenRouteProp = RouteProp<RootStackParamList, "Room">;
// type RoomScreenNavigationProp = StackNavigationProp<RootStackParamList, "Room">;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold",
  },
  box: {
    height: 150,
    width: 150,
    backgroundColor: "blue",
    borderRadius: 5,
  },
});
