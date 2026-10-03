import config from '../config';
import UserRepository from './repositories/UserRepository';
import MessageRepository from './repositories/MessageRepository';
import RoomRepository from './repositories/RoomRepository';
import UserRoomRepository from './repositories/UserRoomRepository';

function configUserRepository() {
  if (config.DB === 'mysql') return new UserRepository();
}

function configMessageRepository() {
  if (config.DB === 'mysql') return new MessageRepository();
}

function configRoomRepository() {
  if (config.DB === 'mysql') return new RoomRepository();
}

function configUserRoomRepository() {
  if (config.DB === 'mysql') return new UserRoomRepository();
}

export const userRepository = configUserRepository();
export const messageRepository = configMessageRepository();
export const roomRepository = configRoomRepository();
export const userRoomRepository = configUserRoomRepository();
