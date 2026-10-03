import { ServerSocket } from '../socket';
import { roomRepository } from '../../infrastructure/dependecy-injection';
import { RoomData } from '../Interfaces';

export const createRoom = async (serverSocket: ServerSocket, data: RoomData) => {
  const { roomName, isPrivate } = data;
  try {
    // check if roomName already is in use
    const existingRoom = await roomRepository!.retrieveRoomByName(roomName);
    // In case it is a private room, check if it exists with the names inverted.
    const invertedRoomName = '🔏' + roomName.slice(2).split('↔').reverse().join('↔');
    const existingRoomInverted = await roomRepository!.retrieveRoomByName(
      invertedRoomName
    );
    // console.log(roomName, invertedRoomName);
    if (!existingRoom && !existingRoomInverted) {
      await roomRepository!.createRoom(roomName, isPrivate);
      // Get the list all rooms with their users
      const rooms = await roomRepository!.getAllRoomsAndUsers();
      serverSocket.io.emit('update_rooms', rooms);
      // Room is created but user remains where he/she is.
    }
  } catch (err) {
    console.log('Create room fail:', err);
  }
};
