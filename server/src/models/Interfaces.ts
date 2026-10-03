export interface ActiveUser {
  [key: string]: string;
}

export interface TokenPayloadInterface {
  userName?: string;
  userId?: number;
}

export interface MessageData {
  userId: number | null;
  userName: string | null;
  roomName: string;
  message: string;
}

export interface RoomData {
  roomName: string;
  isPrivate?: boolean;
}

export interface Room {
  roomId: number;
  roomName: string;
  isPrivate: boolean;
}

export interface enterRoomData {
  userId: number;
  roomName: string;
}

export interface Message {
  text?: string;
  room?: string;
  UserId: string;
  created_at: string; // string because we'll be fetching JSON data, which does not admit Date objects.
}

export interface User {
  userId: number;
  username: string;
}
