import { Button } from 'react-bootstrap';
import { Room, User } from '../Interfaces/Interfaces';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { motion } from 'framer-motion';

interface ConnectedUsersBoxProps {
  socket: Socket | undefined;
  currentUser: User;
  currentRoom: string | undefined;
  roomList: Room[];
}

const ConnectedUsersBox = (props: ConnectedUsersBoxProps) => {
  const { socket, currentUser, currentRoom, roomList } = props;
  const navigate = useNavigate();
  // Get the room where the user is
  const room: Room | undefined = roomList.find(
    (roomObj) => roomObj.roomName === currentRoom
  );

  const currentUserId = currentUser.userId;

  // Get the users of the current room
  const usersToShow = room?.users ? [...room.users] : [];

  // Show own user at the top of the list
  usersToShow.map((user, index) => {
    if (user.userId === currentUserId) {
      const ownUser = usersToShow[index];
      usersToShow.splice(index, 1);
      usersToShow.unshift(ownUser);
      return user.userName;
    } else {
      return user.userName;
    }
  });

  const handleUserClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // Extract username from button clicked
    const clickedUser = event.currentTarget.innerText.slice(2);
    if (clickedUser !== currentUser.userName) {
      const response = await fetch('/api/users/tokeninfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: localStorage.getItem('token') }),
      });
      if (!response.ok) {
        alert('You are not authorized, please log in or register.');
        navigate('/gatochat/login');
        return;
      }
      const newRoomName = `🔏${currentUser.userName}↔${clickedUser}`;
      const data = {
        roomName: newRoomName,
        isPrivate: true,
      };
      socket?.emit('create_room', data);
    }
  };

  return (
    <div className="user-list">
      <div className="d-grid gap-1">
        {room?.users &&
          room.users.length > 0 &&
          usersToShow.map((user) => {
            return (
              <motion.div
                style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                key={user.userId}
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  opacity: { ease: 'linear' },
                  layout: { duration: 0.5 },
                  type: 'spring',
                  stiffness: 260,
                }}
              >
                <Button
                  variant={`${user.userId === currentUserId ? 'warning' : 'primary'}`}
                  size="sm"
                  className="text-truncate"
                  onClick={handleUserClick}
                >
                  🐱{user.userName}
                </Button>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

export default ConnectedUsersBox;
