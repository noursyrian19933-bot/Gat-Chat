import { Server as HTTPServer } from 'http';
import { Socket, Server } from 'socket.io';
import { ActiveUser } from './Interfaces';
import * as evListenersEmitters from './evListeners-Emitters';

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;
  public activeUsers: ActiveUser;
  /* serverSocket.users is an object of user objects like this,
   where the key is the user object stringified and the value is his/her socket id:
  {
    '{"userId":1,"userName":"admin"}': '1Y2Z3X4W5V6U7T8S9R0Q',
    ...
  } */

  constructor(server: HTTPServer) {
    ServerSocket.instance = this;
    this.activeUsers = {};
    this.io = new Server(server, {
      // initialize the socket.io server
      serveClient: false, // don't serve the client files
      pingInterval: 10000, // send pings every 10 seconds
      pingTimeout: 5000, // consider a client disconnected after 5 seconds of inactivity
      cookie: false, // don't use cookies
      cors: {
        origin: '*', // allow all origins
      },
    });
    this.io.on('connect', this.StartListeners); //socket will be injected in here by the io.on('connect') event
    console.info('Socket.io server started, awaiting connections...📡📡');
  }

  StartListeners = (socket: Socket) => {
    // *SOCKET IDS ARE UNIQUE TO EACH CONNECTION OR BROWSER WINDOW
    console.info('Life signs received from: ' + socket.id);

    socket.on('integrate', (loggedUser, callback) => {
      evListenersEmitters.integrate(this, socket, loggedUser, callback);
    });

    socket.on('disconnect', () => {
      console.info('Disconnect received from ' + socket.id);
      evListenersEmitters.disconnect(this, socket);
    });

    socket.on('enter_room', (data) => {
      evListenersEmitters.enterRoom(this, socket, data);
    });

    socket.on('new_message', (data) => {
      evListenersEmitters.newMessage(this, data);
    });

    socket.on('create_room', (data) => {
      evListenersEmitters.createRoom(this, data);
    });
    socket.on('delete_room', (roomName) => {
      evListenersEmitters.deleteRoom(this, roomName);
    });
  };

  GetUinfoKeyFromSocketId = (socketId: string) =>
    Object.keys(this.activeUsers).find(
      (userInfos) => this.activeUsers[userInfos] === socketId
    );
}
