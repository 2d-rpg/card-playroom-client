// Websocket message structure definition

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Status = "Ok" | "Error";
type Event = "GetRoomList" | "CreateRoom" | "EnterRoom";

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
