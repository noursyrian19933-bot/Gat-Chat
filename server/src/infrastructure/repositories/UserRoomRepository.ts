import { UserRoom } from '../../models/initModels';

class UserRoomRepository {
  async findRoomByUserId(userId: number) {
    const room = await UserRoom.findOne({ where: { userId }, raw: true });
    // raw: true returns an object instead of an instance.
    return room;
    // Returns a room object containing userId and roomId.
  }

  //   Delete room entries containing userId (when a user disconnects)
  async deleteUserRooms(userId: number) {
    await UserRoom.destroy({ where: { userId } });
  }

  //   Add a given user to a given room
  async addUserToRoom(userId: number, roomId: number) {
    await UserRoom.create({ userId, roomId });
  }

  // Retrieve a userId connected to any room by userId
  async findUserByUserId(userId: number) {
    const connectedUser = await UserRoom.findOne({ where: { userId }, raw: true });
    return connectedUser;
  }
}

export default UserRoomRepository;
