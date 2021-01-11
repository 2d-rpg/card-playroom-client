import React, { ReactElement, useRef, useEffect } from "react";
import { StyleSheet, View, Text, Animated, PanResponder } from "react-native";
// import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";

export default function RoomScreen({
  route,
}: {
  route: RoomScreenRouteProp;
}): ReactElement {
  const { roomname, endpoint } = route.params;
  const pan = useRef(new Animated.ValueXY()).current;
  const websocket = useRef<WebSocket | null>(null);
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
          websocket.current?.send(JSON.stringify(pan));
        }
      },
    })
  ).current;

  useEffect(() => {
    try {
      websocket.current = new WebSocket(`ws://${endpoint}/ws`);
      websocket.current.onopen = () => {
        // ルーム入室
        websocket.current?.send(`/join ${roomname}`);
      };
      // イベント受け取り
      websocket.current.onmessage = (event) => {
        console.log("received event:" + event.data);
        if (event.data.startsWith("{")) {
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
        <View style={styles.box} />
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
