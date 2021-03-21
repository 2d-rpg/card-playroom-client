import React, { ReactElement, useRef, useState } from "react";
import { Animated, PanResponder, View } from "react-native";
import { Card } from "./Card";
import {
  TapGestureHandler,
  RotationGestureHandler,
} from "react-native-gesture-handler";

export const MovableCard = (props: {
  face: string | undefined;
  back: string | undefined;
  width: number;
  height: number;
  endpoint: string;
  onCardRelease: () => void;
  position: Animated.ValueXY;
}): ReactElement => {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // pan.x: Animated.value には_valueプロパティが見つからないため
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const panX = props.position.x as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const panY = props.position.y as any;
        props.position.setOffset({
          x: panX._value,
          y: panY._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: props.position.x, dy: props.position.y }],
        {
          useNativeDriver: false,
        }
      ),
      onPanResponderRelease: props.onCardRelease,
    })
  ).current;

  return (
    <Animated.View
      style={{
        transform: [
          { translateX: props.position.x },
          { translateY: props.position.y },
        ],
      }}
      {...panResponder.panHandlers}
    >
      <TapGestureHandler onHandlerStateChange={() => console.log(props.face)}>
        {/* TODO Viewがないとcrashする */}
        {/* https://github.com/software-mansion/react-native-gesture-handler/issues/711 */}
        <View>
          <Card
            facePath={props.face}
            backPath={props.back}
            height={props.height}
            width={props.width}
            endpoint={props.endpoint}
          />
        </View>
      </TapGestureHandler>
    </Animated.View>
  );
};
