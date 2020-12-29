import React, { ReactElement, useRef, useState, useEffect } from "react";
import { StyleSheet, View, Text, Animated, PanResponder } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RoomScreen({
  route,
  navigation,
}: {
  route: RoomScreenRouteProp;
  navigation: RoomScreenNavigationProp;
}): ReactElement {
  const pan = useRef(new Animated.ValueXY()).current;
  const socket = useRef<WebSocket | null>(null);
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // pan.x: Animated.value には_valueプロパティが見つからないため
        const panX = pan.x as any;
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
        console.log(socket.current);
        if (socket.current != null) {
          // ポジションをjsonとしてサーバに送信
          socket.current.send(JSON.stringify(pan));
        }
      },
    })
  ).current;

  useEffect(() => {
    (async () => {
      try {
        const endpointFromPreferences = await AsyncStorage.getItem("@endpoint");
        if (endpointFromPreferences != null) {
          socket.current = new WebSocket(`ws://${endpointFromPreferences}/ws`);
          // イベント受け取り
          console.log(socket.current);
          socket.current.onmessage = (event) => {
            console.log("received event:" + event.data);
            if (event.data.startsWith("{")) {
              // TODO サーバ側ですべてjson parsableになるよう実装
              const data = JSON.parse(event.data);
              pan.setValue({ x: data.x, y: data.y });
            }
          };
        }
      } catch (error) {
        // 設定読み込みエラー
        console.log(error);
      }
    })();
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
type RoomScreenNavigationProp = StackNavigationProp<RootStackParamList, "Room">;

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
