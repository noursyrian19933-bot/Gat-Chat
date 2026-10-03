import { Button } from 'react-bootstrap';
import { Room, User } from '../Interfaces/Interfaces';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { getDatabase, ref, set, get } from 'firebase/database';

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

  // Helper to remove rank badges like (# Admin #) from username
  const cleanUserName = (name: string) => {
    if (!name) return '';
    return name.replace(/\s*\(#.*?#\)\s*/g, '').trim();
  };

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

  // دالة بدء المحادثة الخاصة
  const startPrivateChat = async (clickedUser: string) => {
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
  };

  // دالة تغيير أو سحب الرتبة في الفايربيس
  const changeUserRole = async (targetUserId: string, targetUserName: string) => {
    const choice = prompt(
      `إدارة رتبة المستخدم: ${targetUserName}\n\nاختر رقم الرتبة:\n1. أدمن (admin)\n2. سوبر أدمن (super_admin)\n3. بريميوم (premium)\n4. سحب الرتبة (user)`
    );

    if (!choice) return;

    let newRole = '';
    if (choice === '1') newRole = 'admin';
    else if (choice === '2') newRole = 'super_admin';
    else if (choice === '3') newRole = 'premium';
    else if (choice === '4') newRole = 'user';
    else {
      alert('اختيار غير صحيح!');
      return;
    }

    const db = getDatabase();
    try {
      await set(ref(db, `users/${targetUserId}/role`), newRole);
      alert(`تم تعديل رتبة ${targetUserName} إلى (${newRole}) بنجاح!`);
    } catch (error: any) {
      alert(`فشلت العملية: ${error.message || 'لا تملك صلاحيات Owner'}`);
    }
  };

  // التعامل مع الضغط على أي مستخدم في القائمة
  const handleUserClick = async (targetUser: User) => {
    const cleanClickedUser = cleanUserName(targetUser.userName);
    const cleanCurrentUserName = cleanUserName(currentUser.userName);

    // إذا ضغط الشخص على اسمه لا يفعل شيئاً
    if (cleanClickedUser === cleanCurrentUserName) return;

    const db = getDatabase();
    let isOwner = false;

    // فحص هل الحساب الحالي لديه رتبة owner
    try {
      const snapshot = await get(ref(db, `users/${currentUserId}/role`));
      if (snapshot.exists() && snapshot.val() === 'owner') {
        isOwner = true;
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }

    if (isOwner) {
      const action = prompt(
        `اختر إجرائك للمستخدم (${cleanClickedUser}):\n1. بدء محادثة خاصة\n2. تغيير / سحب الرتبة`
      );
      if (action === '1') {
        startPrivateChat(cleanClickedUser);
      } else if (action === '2') {
        changeUserRole(targetUser.userId, cleanClickedUser);
      }
    } else {
      startPrivateChat(cleanClickedUser);
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
                  onClick={() => handleUserClick(user)}
                >
                  🐱{cleanUserName(user.userName)}
                </Button>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

export default ConnectedUsersBox;
