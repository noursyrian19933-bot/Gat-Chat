import { User } from '../../models/initModels';

class UserRepository {
  async create(userName: string, password: string) {
    const newUser = await User.create({ userName, password });
    const returnedUser = {
      userId: newUser.userId,
      userName: newUser.userName,
    };
    return returnedUser;
  }

  async retrieveByName(userName: string) {
    const existingUser = await User.findOne(
      { where: { userName } },
      { attributes: ['userId', 'userName'] }
    );
    return existingUser;
  }

  async retrieveById(userId: number) {
    let existingUser = await User.findOne({
      where: { userId },
      attributes: ['userId', 'userName'],
    });
    return existingUser;
  }
}

export default UserRepository;
