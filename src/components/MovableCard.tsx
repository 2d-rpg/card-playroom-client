import React, { ReactElement, useRef, useState } from "react";
import { Animated, PanResponder, View } from "react-native";
import { Card } from "./Card";
import {
  TapGestureHandler,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { event } from "react-native-reanimated";

export const MovableCard = (props: {
  face: string | undefined;
  back: string | undefined;
  width: number;
  height: number;
  endpoint: string;
  onCardRelease: () => void;
  position: Animated.ValueXY;
}): ReactElement => {
  const doubleTapRef = React.createRef<TapGestureHandler>();
  const onSingleTap = (event: TapGestureHandlerStateChangeEvent) => {
    console.log(`1: ${event.nativeEvent.state}`);
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log("single tap");
    }
  };
  const onDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    console.log(`2: ${event.nativeEvent.state}`);
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log("double tap");
    }
  };
  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          x: props.position.x,
          y: props.position.y,
        },
      },
    ],
    { useNativeDriver: false }
  );
  return (
    <PanGestureHandler onGestureEvent={onPanGestureEvent}>
      <Animated.View
        style={{
          transform: [
            { translateX: props.position.x },
            { translateY: props.position.y },
          ],
        }}
      >
        <TapGestureHandler
          onHandlerStateChange={onSingleTap}
          waitFor={doubleTapRef}
        >
          <TapGestureHandler
            ref={doubleTapRef}
            onHandlerStateChange={onDoubleTap}
            numberOfTaps={2}
          >
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
        </TapGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};
