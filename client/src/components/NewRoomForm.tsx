import { useRef } from 'react';
import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { Socket } from 'socket.io-client';
import { Room } from '../Interfaces/Interfaces';
import { useNavigate } from 'react-router-dom';

interface NewRoomFormProps {
  socket: Socket | undefined;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  rooms: Room[];
}

const NewRoomForm = (props: NewRoomFormProps) => {
  const navigate = useNavigate();
  const { socket } = props;

  const roomRef = useRef<HTMLInputElement>(null);

  const handleRoomCreate = async (
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const newRoomInput: string = roomRef.current?.value || '';
    if (newRoomInput.trim() === '') {
      roomRef.current!.value = '';
      alert('No room name to create❓❗');
      return;
    }
    // *Check if the room already exists
    const roomExists = props.rooms.find((room) => room.roomName === newRoomInput);
    if (roomExists) {
      roomRef.current!.value = '';
      alert('Room already exists❗');
      return;
    }
    if (newRoomInput !== null) {
      // *Make a fetch request to check the token
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
      const data = {
        roomName: newRoomInput,
      };
      socket?.emit('create_room', data);
      // reset the newRoomInput field
      roomRef.current!.value = '';
    }
  };

  const handleKeyEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleRoomCreate(event);
    }
  };

  return (
    <div className="room-field">
      <Form.Group>
        <div className="d-grid gap-1 d-flex">
          <Form.Control
            ref={roomRef}
            type="text"
            className="p-1 mx-0"
            placeholder="Add new room"
            onKeyDown={handleKeyEnter}
          />
          <Button
            type="submit"
            variant="danger"
            className="m-0"
            size="sm"
            onClick={handleRoomCreate}
          >
            ➕
          </Button>
        </div>
      </Form.Group>
    </div>
  );
};

export default NewRoomForm;
