import moment from 'moment';
import { Message } from '../../models/initModels';

class MessageRepository {
  // Afegir un missatge d'un user al welcome xat o a una room en concret si aplica.
  async createMessage(
    userId: number | null,
    userName: string | null,
    roomId: number,
    message: string
  ) {
    const msgDate = moment().format('YYYY-MM-DD, HH:mm:ss');
    await Message.create({ message, createdAt: msgDate, userId, roomId, userName });
  }

  // Recover all messages existing in a room.
  async retrieveRoomMessages(roomId: number) {
    const messageList = await Message.findAll({
      where: { roomId },
      order: [['createdAt', 'ASC']],
      attributes: ['messageId', 'message', 'createdAt', 'userName', 'userId', 'roomId'],
    });
    return messageList;
    //this query, along with the messages it includes the user who wrote it (as: 'user')
  }

  async deleteMessagesFromRoom(roomId: number) {
    await Message.destroy({ where: { roomId } });
  }
}

export default MessageRepository;
