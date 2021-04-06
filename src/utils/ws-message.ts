// Websocket message structure definition

import { CardInRoom } from "./server-card-interface";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Status = "Ok" | "Error";
type Event =
  | "GetRoomList"
  | "CreateRoom"
  | "EnterRoom"
  | "CardsInfo"
  | "SomeoneEnterRoom";

export interface Room {
  id: string;
  name: string;
  num: number;
}

export interface WsMessage {
  status: Status;
  event: Event;
  data: any;
}

export interface GetRoomListMessage extends WsMessage {
  data: Room[];
}
export const isGetRoomListMessage = (arg: any): arg is GetRoomListMessage => {
  return arg.status === "Ok" && arg.event === "GetRoomList";
};

export interface EnterRoomMessage extends WsMessage {
  data: Room;
}
export const isEnterRoomMessage = (arg: any): arg is EnterRoomMessage => {
  return arg.status === "Ok" && arg.event === "EnterRoom";
};

export interface CreateRoomMessage extends WsMessage {
  data: Room;
}
export const isCreateRoomMessage = (arg: any): arg is CreateRoomMessage => {
  return arg.status === "Ok" && arg.event === "CreateRoom";
};

export interface CardsInfoMessage extends WsMessage {
  data: CardInRoom[];
}
export const isCardsInfoMessage = (arg: any): arg is CardsInfoMessage => {
  return arg.status === "Ok" && arg.event === "CardsInfo";
};

export interface SomeoneEnterRoomMessage extends WsMessage {
  data: Room;
}
export const isSomeoneEnterRoomMessage = (
  arg: any
): arg is EnterRoomMessage => {
  return arg.status === "Ok" && arg.event === "SomeoneEnterRoom";
};
