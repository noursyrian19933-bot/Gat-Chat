import { ServerSocket } from '../socket';
import {
  messageRepository,
  roomRepository,
} from '../../infrastructure/dependecy-injection';
import { MessageData } from '../Interfaces';

export const newMessage = async (serverSocket: ServerSocket, data: MessageData) => {
  const { userId, userName, roomName, message } = data;
  try {
    // Retrieve room object where msg came from
    const room = await roomRepository!.retrieveRoomByName(roomName);
    // save message on db
    await messageRepository!.createMessage(userId, userName, room.roomId, message);

    // Once done, get all updated messages for this room, including their respective user info.
    const messages = await messageRepository!.retrieveRoomMessages(room.roomId);
    // console.log(messages[messages.length - 1]);

    // Send updated messages to all users in the room
    serverSocket.io.to(room.roomName).emit('update_messages', {
      roomName: room.roomName,
      newMessages: messages,
    });
  } catch (err) {
    console.log('update_messages fail:', err);
  }
};
