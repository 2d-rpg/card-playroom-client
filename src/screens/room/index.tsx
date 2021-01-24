import React, { ReactElement, useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
} from "react-native";
// import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { gql, useQuery } from "@apollo/client";
import Card from "../../components/Card";

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
  const pan = useRef(new Animated.ValueXY()).current;
  const websocket = useRef<WebSocket | null>(null);
  const cardsQueryResult = useQuery<ServerCards>(GET_SERVER_CARDS);
  const [firstCard, setFirstCard] = useState<ServerCard | null>(null);
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // pan.x: Animated.value には_valueプロパティが見つからないため
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const panX = pan.x as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const panY = pan.y as any;
        pan.setOffset({
          x: panX._value,
          y: panY._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // ポジションをjsonとしてサーバに送信
        if (
          websocket.current != null &&
          websocket.current.readyState == WebSocket.OPEN
        ) {
          websocket.current.send(JSON.stringify(pan));
        }
      },
    })
  ).current;

  // カードをサーバーからロード
  useEffect(() => {
    if (cardsQueryResult != null && !cardsQueryResult.loading) {
      if (cardsQueryResult.error == null) {
        const serverCards = cardsQueryResult.data?.cards;
        if (serverCards != null) {
          const firstOne = serverCards.find((card) => card.id === cardIds[0]);
          console.log(`found: ${firstOne}`);
          console.log(firstOne);
          if (firstOne != null) {
            setFirstCard(firstOne);
            console.log(`set first card`);
          }
        }
      }
    }
  }, [cardsQueryResult]);

  useEffect(() => {
    try {
      websocket.current = new WebSocket(`ws://${endpoint}/ws`);
      websocket.current.onopen = () => {
        // ルーム入室
        websocket.current?.send(`/join ${roomid}`);
      };
      // イベント受け取り
      websocket.current.onmessage = (event) => {
        console.log("received event:" + event.data);
        if (event.data.startsWith('{"x')) {
          // TODO サーバ側ですべてjson parsableになるよう実装
          const data = JSON.parse(event.data);
          pan.setValue({ x: data.x, y: data.y });
        } else if (event.data == "Someone joined") {
          // TODO 3人以上のとき、2人以上から送られてくることになり、危険
          websocket.current?.send(JSON.stringify(pan));
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

  const renderCard = () => {
    const renderItem =
      firstCard != null ? (
        <Card
          facePath={firstCard.face}
          backPath={firstCard.back}
          height={cardHeight}
          width={cardWidth}
          endpoint={endpoint}
        />
      ) : (
        <ActivityIndicator />
      );
    return renderItem;
  };

  // TODO WebSocket接続エラーの対応
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Drag this box!</Text>
      <Animated.View
        style={{
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        }}
        {...panResponder.panHandlers}
      >
        {renderCard()}
      </Animated.View>
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
