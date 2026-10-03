import { ServerSocket } from '../socket';
import {
  userRepository,
  roomRepository,
  userRoomRepository,
} from '../../infrastructure/dependecy-injection';
import { newMessage } from './newMessage';
import { enterRoomData } from '../Interfaces';
import { Socket } from 'socket.io';

// When a user enters a room, he/she is removed from the previous one, so, several things happen.

export const enterRoom = async (
  serverSocket: ServerSocket,
  socket: Socket,
  data: enterRoomData
) => {
  const { userId, roomName } = data;
  socket.join(roomName);

  try {
    // Retrieve user
    const user = await userRepository!.retrieveById(userId); // userId & userName

    // Get the previous room where the user was in, if any
    const previousRoom = await userRoomRepository!.findRoomByUserId(user.userId); // returns an object

    // Delete current user from any other previous rooms he/she was in.
    let previousRoomObj = null;
    if (previousRoom) {
      await userRoomRepository!.deleteUserRooms(user.userId);
      // Retrieve previous room object
      previousRoomObj = await roomRepository!.retrieveRoomById(previousRoom.roomId);
    }

    // Retrieve next room where he/she wants to enter
    const nextRoom = await roomRepository!.retrieveRoomByName(roomName);

    // Add user to the new room at the userRoom table (which is the one that contains the userId and the roomId)
    await userRoomRepository!.addUserToRoom(userId, nextRoom.roomId);

    // The user is in the new room ###########################

    // Inform other users in the new room and the ones of the previous room too----------------------
    if (previousRoomObj) {
      const previousRoomData = {
        userId: null,
        userName: null,
        roomName: previousRoomObj.roomName,
        message: `${user.userName} is gone bye bye 👋🏻👋🏻`,
      };
      socket.leave(previousRoomObj.roomName);

      await newMessage(serverSocket, previousRoomData);
    }

    const nextRoomData = {
      userId: null,
      userName: null,
      roomName: nextRoom.roomName, // this is the new current room being informed of the new arrival.
      message: `${user.userName} joined the room👏🏻`,
    };
    await newMessage(serverSocket, nextRoomData);
    // Users have been informed ---------------------------------------------------------------------

    //* Get the list all rooms with their users
    const rooms = await roomRepository!.getAllRoomsAndUsers();
    serverSocket.io.emit('update_user_room', { user, nextRoom, rooms });
    // Emit this information to the client side so proper updates are made.
  } catch (err) {
    console.log('update_user_room fail:', err);
  }
};
