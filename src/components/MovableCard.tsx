import React, { ReactElement, useRef, useState } from "react";
import { Animated, PanResponder } from "react-native";
import { Card } from "./Card";
import { ServerCard } from "../utils/server-card-interface";

export const MovableCard = (props: {
  serverCard: ServerCard;
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

  const renderCard = () => {
    const renderItem = (
      <Card
        facePath={props.serverCard.face}
        backPath={props.serverCard.back}
        height={props.height}
        width={props.width}
        endpoint={props.endpoint}
      />
    );
    return renderItem;
  };

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
      {renderCard()}
    </Animated.View>
  );
};
