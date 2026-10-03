import { useContext, useEffect, useRef } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Message, User } from '../Interfaces/Interfaces';

interface ChatBoxProps {
  messages: Message[];
}

const ChatBox = (props: ChatBoxProps) => {
  const { messages } = props;
  const { appState } = useContext(SocketContext);
  const { userInfos } = appState;

  const user = JSON.parse(userInfos) as User;

  // Scroll to the bottom of the chat-box
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-box" ref={messagesEndRef}>
      {messages.map((msgItem, index) => {
        return (
          <div
            key={index}
            className={`${msgItem.userId === user.userId ? 'ownMsg' : 'message'} ${
              msgItem.userId === null && 'serverMsg'
            }`}
          >
            <small>{msgItem.createdAt}</small>
            <div>
              <p>
                {msgItem.userId === user.userId && <span>You: </span>}
                {msgItem.userId !== null && msgItem.userId !== user.userId && (
                  <span>{msgItem.userName}: </span>
                )}
                {msgItem.message}
              </p>
              {msgItem.userId === null && <hr />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatBox;
