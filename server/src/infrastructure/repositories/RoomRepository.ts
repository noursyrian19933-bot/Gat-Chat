import { Room } from '../../models/initModels';
import { User } from '../../models/initModels';

class RoomRepository {
  async createRoom(roomName: string, isPrivate: boolean = false) {
    await Room.create({ roomName, isPrivate });
  }

  async deleteRoom(roomName: string) {
    await Room.destroy({ where: { roomName } });
  }

  async retrieveRoomByName(roomName: string) {
    const existingRoom = await Room.findOne({ where: { roomName } });
    return existingRoom;
    // return room object containing roomName and roomId
  }

  async retrieveRoomById(roomId: number) {
    let existingRoom = await Room.findOne({ where: { roomId } });
    return existingRoom;
  }

  async getAllRooms() {
    const rooms = await Room.findAll();
    return rooms;
  }

  async getAllRoomsAndUsers() {
    const rooms = await Room.findAll({
      include: [{ model: User }],
    });
    return rooms;
  }
  // returns an array of objects, each object is a room with its users.
  /* e.g. { 
    roomId: 1, 
    roomName: 'welcome',
     users: [ 
      { userId: 1, userName: 'admin'}, {userId: 2, userName: 'person'}
     ] 
    } */
}

export default RoomRepository;
