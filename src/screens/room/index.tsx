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
  const [firstOwnCard, setFirstOwnCard] = useState<ServerCard | null>(null);
  const firstOwnCardRef = useRef<ServerCard | null>(firstOwnCard);
  const [firstOpponentCard, setFirstOpponentCard] = useState<ServerCard | null>(
    null
  );
  const [ownPan, setOwnPan] = useState(new Animated.ValueXY());
  const [opponentPan, setOpponentPan] = useState(new Animated.ValueXY());

  // カードをサーバーからロード
  useEffect(() => {
    if (cardsQueryResult != null && !cardsQueryResult.loading) {
      if (cardsQueryResult.error == null) {
        const serverCards = cardsQueryResult.data?.cards;
        if (serverCards != null) {
          const firstOne = serverCards.find((card) => card.id === cardIds[0]);
          if (firstOne != null) {
            setFirstOwnCard(firstOne);
            console.log(`set first card`);
          }
        }
      }
    }
  }, [cardsQueryResult]);

  useEffect(() => {
    if (
      firstOwnCard != null &&
      websocket.current != null &&
      websocket.current.readyState === WebSocket.OPEN
    ) {
      console.log("send own card info when changed!");
      console.log(firstOwnCard);
      websocket.current.send(JSON.stringify(firstOwnCard));
    }
  }, [firstOwnCard, websocket.current]);

  useEffect(() => {
    console.log("Opponent card changed!");
    console.log(firstOpponentCard);
  }, [firstOpponentCard]);

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
        if (websocket.current?.readyState === WebSocket.OPEN) {
          console.log("received event:" + event.data);
          if (event.data.startsWith('{"kind')) {
            // TODO サーバ側ですべてjson parsableになるよう実装
            const data = JSON.parse(event.data);
            if (data.kind === "opponent") {
              ownPan.setValue({ x: data.x, y: data.y });
            } else {
              opponentPan.setValue({ x: data.x, y: data.y });
            }
          } else if (event.data == "Someone connected") {
            // TODO 3人以上のとき、2人以上から送られてくることになり、危険
            console.log("!!!!!!!!!!!!!OUTSIDE!!!!!!!!!!!!!");
            console.log(firstOwnCardRef.current);
            if (firstOwnCardRef.current != null) {
              console.log("!!!!!!!!!!!!!INSIDE!!!!!!!!!!!!!");
              console.log("send Own card info when someone connected!");
              websocket.current?.send(JSON.stringify(firstOwnCardRef.current));
            }
          } else if (
            event.data.startsWith('{"__typename') ||
            event.data.startsWith('{"id')
          ) {
            console.log("receive opponent card info");
            const data = JSON.parse(event.data);
            setFirstOpponentCard(data);
          }
        }
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

  useEffect(() => {
    firstOwnCardRef.current = firstOwnCard;
  }, [firstOwnCard]);

  const ownCard = (ownCard: ServerCard | null) =>
    !ownCard ? (
      <ActivityIndicator />
    ) : (
      <MovableCard
        serverCard={ownCard}
        width={cardWidth}
        height={cardHeight}
        endpoint={endpoint}
        websocket={websocket.current}
        position={ownPan}
        setPosition={setOwnPan}
        kind="own"
      />
    );

  // TODO 退出後再入室するとカードが表示されない
  // TODO 他の人が入ってきたときその人のカードが表示されない
  const renderOpponentCard = (opponentCard: ServerCard | null) =>
    !opponentCard ? (
      <ActivityIndicator />
    ) : (
      <MovableCard
        serverCard={opponentCard}
        width={cardWidth}
        height={cardHeight}
        endpoint={endpoint}
        websocket={websocket.current}
        position={opponentPan}
        setPosition={setOpponentPan}
        kind="opponent"
      />
    );

  // TODO WebSocket接続エラーの対応
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Drag this box!</Text>
      {ownCard(firstOwnCard)}
      {renderOpponentCard(firstOpponentCard)}
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
