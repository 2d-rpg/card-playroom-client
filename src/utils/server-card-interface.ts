import { Animated } from "react-native";

export interface ServerCard {
  id: number;
  face: string | undefined;
  back: string | undefined;
}

export interface ServerCards {
  cards: ServerCard[];
}

export interface CardInRoom extends ServerCard {
  index: number;
  own: boolean;
  position: Animated.ValueXY;
}
