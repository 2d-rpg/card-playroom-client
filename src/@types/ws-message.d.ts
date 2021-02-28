type Status = "ok" | "error";
type Event = "GetRoomList" | "CreateRoom" | "EnterRoom";

export interface Room {
  id: string;
  name: string;
  num: number;
}
type Data = Room | Room[];

export interface WsMessage {
  status: Status;
  event: Event;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface GetRoomListMessage extends WsMessage {
  data: Room[];
}
export const isGetRoomListMessage = (
  arg: unknown
): arg is GetRoomListMessage => {
  return arg.status === "ok" && arg.event === "GetRoomList";
};

export interface EnterRoomMessage extends WsMessage {
  data: Room;
}
export const isEnterRoomMessage = (arg: unknown): arg is EnterRoomMessage => {
  return arg.status === "ok" && arg.event === "EnterRoom";
};

export interface CreateRoomMessage extends WsMessage {
  data: Room;
}
export const isCreateRoomMessage = (arg: unknown): arg is CreateRoomMessage => {
  return arg.status === "ok" && arg.event === "CreateRoom";
};
