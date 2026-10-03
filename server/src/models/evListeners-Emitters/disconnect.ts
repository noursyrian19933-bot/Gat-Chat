import { Socket } from 'socket.io';
import { ServerSocket } from '../socket';
import {
  roomRepository,
  userRoomRepository,
} from '../../infrastructure/dependecy-injection';
import { newMessage } from './newMessage';

export const disconnect = async (serverSocket: ServerSocket, socket: Socket) => {
  const userToDisconnect = serverSocket.GetUinfoKeyFromSocketId(socket.id);
  // get the user object from the socket id
  /* {
    userId: loggedUser.userId,
    userName: loggedUser.userName
  }*/

  const userInfoToDisconnect = JSON.parse(userToDisconnect!);

  if (userInfoToDisconnect) {
    // Get the room were the disconnect came from
    const userRoom = await userRoomRepository?.findRoomByUserId(
      userInfoToDisconnect.userId
    );
    // Returns a room object containing userId and roomId.

    // retrieve room name from room id
    const userRoomObject = await roomRepository?.retrieveRoomById(userRoom.roomId);

    // Delete user from user-room table
    await userRoomRepository!.deleteUserRooms(userInfoToDisconnect.userId);

    //* Get the updated list all rooms with their users
    const rooms = await roomRepository!.getAllRoomsAndUsers();

    // Delete user from active users list on socket server
    delete serverSocket.activeUsers[userToDisconnect!];

    // Retrieve updated list of active users
    const users = Object.keys(serverSocket.activeUsers);

    // send the users array to all remaining connected users.
    const data = {
      userId: null,
      userName: null,
      roomName: userRoomObject.roomName,
      message: `${userInfoToDisconnect.userName} is gone bye bye 👋🏻👋🏻`,
    };
    await newMessage(serverSocket, data);
    serverSocket.io.emit('update_user_room', { users, rooms });
  }
};
