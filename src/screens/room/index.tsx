import React, { ReactElement, useRef, useState, useEffect } from "react";
import { StyleSheet, View, Text, Animated, PanResponder } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { DEFAULT_ENDPOINT } from "../preferences";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RoomScreen({
  route,
  navigation,
}: {
  route: RoomScreenRouteProp;
  navigation: RoomScreenNavigationProp;
}): ReactElement {
  const pan = useRef(new Animated.ValueXY()).current;
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
        socket.send(JSON.stringify(pan)); // ポジションをjsonとしてサーバに送信
      },
    })
  ).current;

  // Websocket
  const socket = new WebSocket(`ws://${DEFAULT_ENDPOINT}/ws`);

  // イベント受け取り
  socket.onmessage = (event) => {
    console.log("received event:" + event.data);
    if (event.data.startsWith("{")) {
      const data = JSON.parse(event.data); // TODO サーバ側ですべてjson parsable になるよう実装
      pan.setValue({ x: data.x, y: data.y });
    }
  };

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
