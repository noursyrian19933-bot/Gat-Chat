import { useState } from 'react';
import { Button, Modal, Badge } from 'react-bootstrap';
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

  // حالات التحكم بالنافذة المنبثقة للمستخدم المحدد
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);

  // جلب الغرفة الحالية
  const room: Room | undefined = roomList.find(
    (roomObj) => roomObj.roomName === currentRoom
  );

  const currentUserId = currentUser.userId;

  // تنظيف اسم المستخدم من الرتب
  const cleanUserName = (name: string) => {
    if (!name) return '';
    return name.replace(/\s*\(#.*?#\)\s*/g, '').trim();
  };

  // تجهيز قائمة المستخدمين لعرض الحساب الحالي في البداية
  const usersToShow = room?.users ? [...room.users] : [];
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

  // 1. بدء محادثة خاصة
  const startPrivateChat = async (targetUserName: string) => {
    setShowModal(false);
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
    const newRoomName = `🔏${currentUser.userName}↔${targetUserName}`;
    const data = {
      roomName: newRoomName,
      isPrivate: true,
    };
    socket?.emit('create_room', data);
  };

  // 2. تحديث الرتبة في الفايربيس
  const handleAssignRole = async (newRole: string) => {
    if (!selectedUser) return;
    setLoadingRole(true);

    const db = getDatabase();
    const cleanName = cleanUserName(selectedUser.userName);

    try {
      await set(ref(db, `users/${selectedUser.userId}/role`), newRole);
      alert(`تم تحديث رتبة ${cleanName} إلى (${newRole}) بنجاح!`);
      setShowModal(false);
    } catch (error: any) {
      alert(`فشلت العملية: ${error.message || 'لا تملك صلاحيات Owner'}`);
    } finally {
      setLoadingRole(false);
    }
  };

  // 3. عند الضغط على اسم مستخدم من القائمة
  const handleUserClick = async (targetUser: User) => {
    const cleanClickedUser = cleanUserName(targetUser.userName);
    const cleanCurrentUserName = cleanUserName(currentUser.userName);

    // لا تفعل شيئاً إذا ضغطت على نفسك
    if (cleanClickedUser === cleanCurrentUserName) return;

    setSelectedUser(targetUser);

    // التحقق هل الحساب الحالي يحمل رتبة owner
    const db = getDatabase();
    try {
      const snapshot = await get(ref(db, `users/${currentUserId}/role`));
      if (snapshot.exists() && snapshot.val() === 'owner') {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      setIsOwner(false);
    }

    setShowModal(true);
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

      {/* نافذة خيارات المستخدم المنبثقة */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">
            👤 {selectedUser ? cleanUserName(selectedUser.userName) : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-grid gap-2 text-center">
          {/* زر المحادثة الخاصة للجميع */}
          <Button
            variant="primary"
            onClick={() =>
              selectedUser && startPrivateChat(cleanUserName(selectedUser.userName))
            }
          >
            💬 بدء محادثة خاصة
          </Button>

          {/* خيارات تغيير الرتب (تظهر للـ Owner فقط) */}
          {isOwner && (
            <div className="mt-3 pt-3 border-top">
              <p className="fw-bold text-muted small mb-2">🛡️ إدارة الرتب (خاص بالـ Owner)</p>
              <div className="d-grid gap-2">
                <Button
                  variant="outline-danger"
                  size="sm"
                  disabled={loadingRole}
                  onClick={() => handleAssignRole('admin')}
                >
                  منح رتبة أدمن (Admin)
                </Button>
                <Button
                  variant="outline-dark"
                  size="sm"
                  disabled={loadingRole}
                  onClick={() => handleAssignRole('super_admin')}
                >
                  منح رتبة سوبر أدمن (Super Admin)
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  disabled={loadingRole}
                  onClick={() => handleAssignRole('premium')}
                >
                  منح رتبة بريميوم (Premium)
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={loadingRole}
                  onClick={() => handleAssignRole('user')}
                >
                  ❌ سحب الرتبة (مستخدم عادي)
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ConnectedUsersBox;
