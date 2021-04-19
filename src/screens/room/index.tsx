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
  isFirstCardsInfoMessage,
  isEnterRoomMessage,
  isSomeoneEnterRoomMessage,
  WsMessage,
  isCardsInfoMessage,
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

  const updateCardsArray = (
    cardArray: CardInRoom[],
    newCard: CardInRoom
  ): void => {
    const index = cardArray.findIndex((card) => card.index === newCard.index);
    if (index !== -1) {
      cardArray.splice(index, 1);
      cardArray.push(newCard);
    }
  };

  // カードをサーバーからロード
  useEffect(() => {
    if (cardsQueryResult != null && !cardsQueryResult.loading) {
      if (cardsQueryResult.error == null) {
        const serverCards = cardsQueryResult.data?.cards;
        if (serverCards != null) {
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
                  y: 0,
                }),
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
              };
              return unloadCard;
            }
          });
          setOwnCards(ownCardsInRoom);

          websocket.current = new WebSocket(`ws://${endpoint}/ws`);
          websocket.current.onopen = () => {
            // ルーム入室
            console.log("websocket opened!");
            websocket.current?.send(`/join ${roomid}`);
          };
          websocket.current.onmessage = (event) => {
            const wsMessage: WsMessage = JSON.parse(event.data);
            if (isEnterRoomMessage(wsMessage)) {
              const cardsInfo: CardInRoom[] = refOwnCards.current.map(
                (ownCard) => {
                  const newPosition = new Animated.ValueXY({
                    x: 0,
                    y: cardHeight,
                  });
                  return {
                    id: ownCard.id,
                    face: ownCard.face,
                    back: ownCard.back,
                    index: ownCard.index,
                    own: !ownCard.own,
                    position: newPosition,
                  };
                }
              );
              websocket.current?.send(
                `/first-cards ${JSON.stringify(cardsInfo)}`
              );
            } else if (isSomeoneEnterRoomMessage(wsMessage)) {
              const cardsInfo: CardInRoom[] = refOwnCards.current.map(
                (ownCard) => {
                  const newPosition = new Animated.ValueXY({
                    x: 0,
                    y: cardHeight,
                  });
                  return {
                    id: ownCard.id,
                    face: ownCard.face,
                    back: ownCard.back,
                    index: ownCard.index,
                    own: !ownCard.own,
                    position: newPosition,
                  };
                }
              );
              websocket.current?.send(
                `/first-cards ${JSON.stringify(cardsInfo)}`
              );
            } else if (isFirstCardsInfoMessage(wsMessage)) {
              const opponentCardsInfo: CardInRoom[] = wsMessage.data.map(
                (card) => {
                  return {
                    id: card.id,
                    face: card.face,
                    back: card.back,
                    index: card.index,
                    own: card.own,
                    position: new Animated.ValueXY(card.position),
                  };
                }
              );
              setOpponentCards(opponentCardsInfo);
            } else if (isCardsInfoMessage(wsMessage)) {
              const cardsInfo: CardInRoom[] = wsMessage.data.map((card) => {
                return {
                  id: card.id,
                  face: card.face,
                  back: card.back,
                  index: card.index,
                  own: card.own,
                  position: new Animated.ValueXY(card.position),
                };
              });
              // TODO updateOwnCards or updateOpponentCards
              const newOwnCards = Array.from(refOwnCards.current);
              const newOpponentCards = Array.from(refOpponentCards.current);
              for (const cardInfo of cardsInfo) {
                if (cardInfo.own) {
                  updateCardsArray(newOwnCards, cardInfo);
                } else {
                  updateCardsArray(newOpponentCards, cardInfo);
                }
              }
              setOwnCards(newOwnCards);
              setOpponentCards(newOpponentCards);
            }
          };
        }
      }
    }
    return () => {
      if (websocket.current != null) {
        websocket.current.close();
      }
    };
  }, [cardsQueryResult]);

  useEffect(() => {
    console.log(`opponentCards${opponentCards}`);
  }, [opponentCards]);

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
            console.log(card.position);
            card.position.flattenOffset();
            // ポジションをjsonとしてサーバに送信
            if (
              websocket.current != null &&
              websocket.current.readyState == WebSocket.OPEN
            ) {
              const cardsInfo: CardInRoom[] = [
                {
                  id: card.id,
                  face: card.face,
                  back: card.back,
                  index: card.index,
                  own: !card.own,
                  position: card.position,
                },
              ];
              websocket.current.send(`/cards ${JSON.stringify(cardsInfo)}`);
            }
          }}
          position={card.position}
        />
      ));
      return movableCardComponents;
    }
  };
  return (
    <View style={styles.container}>
      {movableCards(ownCards)}
      {movableCards(opponentCards)}
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
