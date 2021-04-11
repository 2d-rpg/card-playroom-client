import React, { ReactElement, useState } from "react";
import { Animated, View } from "react-native";
import { Card } from "./Card";
import {
  TapGestureHandler,
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler";

export const MovableCard = (props: {
  face: string | undefined;
  back: string | undefined;
  width: number;
  height: number;
  endpoint: string;
  onCardRelease: () => void;
  position: Animated.ValueXY;
  initx: number;
  inity: number;
}): ReactElement => {
  console.log(`Props: ${JSON.stringify(props)}`);
  const [lastOffsetX, setLastOffsetX] = useState(props.initx);
  const [lastOffsetY, setLastOffsetY] = useState(props.inity);
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
          translationX: props.position.x,
          translationY: props.position.y,
        },
      },
    ],
    { useNativeDriver: false }
  );
  const onPanHandleStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setLastOffsetX(lastOffsetX + event.nativeEvent.translationX);
      setLastOffsetY(lastOffsetY + event.nativeEvent.translationY);
    }

    if (event.nativeEvent.state == State.BEGAN) {
      props.position.x.setOffset(lastOffsetX);
      props.position.x.setValue(0);
      props.position.y.setOffset(lastOffsetY);
      props.position.y.setValue(0);
    }

    if (event.nativeEvent.state == State.END) {
      props.onCardRelease();
    }
  };
  return (
    <PanGestureHandler
      onGestureEvent={onPanGestureEvent}
      onHandlerStateChange={onPanHandleStateChange}
    >
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
