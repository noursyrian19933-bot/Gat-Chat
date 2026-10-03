import { useRef, useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Button, Form } from 'react-bootstrap';
import { User } from '../Interfaces/Interfaces';

interface MessageInputProps {
  currentRoom: string | undefined;
}

const MessageInput = (props: MessageInputProps) => {
  const { appState } = useContext(SocketContext);
  const msgInputRef = useRef<HTMLInputElement | null>(null);

  const { userInfos, socket } = appState;

  const user = JSON.parse(userInfos) as User;

  const handleSendMsg = async (
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (!msgInputRef.current?.value || msgInputRef.current?.value.trim() === '') {
      alert('No message to send!');
      return;
    }
    const data = {
      userId: user.userId,
      userName: user.userName,
      roomName: props.currentRoom,
      message: msgInputRef.current?.value,
    };
    // console.log(data);
    socket?.emit('new_message', data);
    msgInputRef.current.value = '';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMsg(event);
    }
  };

  // Auto-focus input when the user enters the chat
  useEffect(() => {
    if (msgInputRef.current) {
      msgInputRef.current.focus();
    }
  }, [props.currentRoom]);

  return (
    <div className="msg-field">
      <Form.Group className="my-0 p-2 d-flex" controlId="">
        <Form.Control ref={msgInputRef} type="text" onKeyDown={handleKeyDown} />
        <Button size="sm" variant="primary" type="submit" onClick={handleSendMsg}>
          Send
        </Button>
      </Form.Group>
    </div>
  );
};

export default MessageInput;
