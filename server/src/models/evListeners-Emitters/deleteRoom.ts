import { ServerSocket } from '../socket';
import {
  messageRepository,
  roomRepository,
} from '../../infrastructure/dependecy-injection';

export const deleteRoom = async (serverSocket: ServerSocket, roomName: string) => {
  try {
    // Get the roomId of the room to be deleted
    const room = await roomRepository!.retrieveRoomByName(roomName);
    await messageRepository!.deleteMessagesFromRoom(room.roomId);
    await roomRepository!.deleteRoom(roomName);
    // Get the list all rooms with their users
    const rooms = await roomRepository!.getAllRoomsAndUsers();
    serverSocket.io.emit('update_rooms', rooms);
  } catch (err) {
    console.log('Create room fail:', err);
  }
};
