import ChatBox from '../components/ChatBox';
import MessageInput from '../components/MessageInput';
import RoomListBox from '../components/RoomListBox';
import ConnectedUsersBox from '../components/ConnectedUsersBox';
import { Button } from 'react-bootstrap';
import ContainerChatWindow from '../layout/ContainerChatWindow';
import { useEffect, useState, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Message, Room, User } from '../Interfaces/Interfaces';
import { useNavigate, useParams } from 'react-router-dom';
import NewRoomForm from '../components/NewRoomForm';

const WelcomeChat = () => {
  const navigate = useNavigate();
  const { currentRoom } = useParams(); // roomName is indicated at the url
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const { appState, dispatch } = useContext(SocketContext);
  const { socket, userInfos } = appState;

  const currentUser = JSON.parse(userInfos) as User;

  // *When I log into the app after login/register
  useEffect(() => {
    const data = {
      userId: currentUser.userId,
      roomName: currentRoom,
    };
    socket?.emit('enter_room', data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // *If anyone enters the room
  useEffect(() => {
    socket?.on('update_user_room', (data) => {
      const { rooms: roomsReceived } = data;
      // all existing rooms with their users
      setRooms(roomsReceived);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom, socket]);

  // *If someone writes a message
  useEffect(() => {
    socket?.on('update_messages', (data) => {
      const { roomName, newMessages } = data;
      if (roomName === currentRoom) {
        setMessages(newMessages);
      }
    });
  }, [currentRoom, socket]);

  // *If a new room is created
  useEffect(() => {
    socket?.on('update_rooms', (updatedRooms) => {
      setRooms(updatedRooms); // all existing rooms
    });
  }, [socket]);

  // *When the user clicks on a room
  const onRoomClickHandler = (nextRoom: string) => {
    navigate(`/chat/${nextRoom}`);
    const data = {
      userId: currentUser.userId,
      roomName: nextRoom,
    };
    socket?.emit('enter_room', data);
  };

  const onRoomDelete = (roomToDelete: string) => {
    socket?.emit('delete_room', roomToDelete);
  };

  const handleExit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    socket?.disconnect();
    dispatch({ type: 'remove_user', payload: null });
    localStorage.removeItem('token');
    navigate('/gatochat/login');
  };

  /*
   * When the user closes the tab it triggers a disconnect event using the javascript window beforeunload event.
   */
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      dispatch({ type: 'remove_user', payload: null });
      localStorage.removeItem('token');
      socket?.disconnect();
    };
    // Add the event listener when the component mounts
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <ContainerChatWindow>
      <NewRoomForm socket={socket} setRooms={setRooms} rooms={rooms} />
      <div className="exit-btn">
        <Button onClick={handleExit}>Disconnect</Button>
      </div>
      <ChatBox messages={messages} />
      <RoomListBox
        roomList={rooms}
        currentRoom={currentRoom}
        onRoomClick={onRoomClickHandler}
        onRoomDelete={onRoomDelete}
        currentUser={currentUser}
      />
      <ConnectedUsersBox
        socket={socket}
        currentUser={currentUser}
        currentRoom={currentRoom}
        roomList={rooms}
      />
      <MessageInput currentRoom={currentRoom} />
    </ContainerChatWindow>
  );
};

export default WelcomeChat;
