export interface User {
  userId?: number;
  userName: string;
  password?: string;
}

export interface RegisterForm extends User {
  confirmPassword?: string;
  formError?: string | null;
}
export interface LoginForm extends User {
  formError?: string | null;
}

export interface RegisterFormProps {
  setLoggedUser: React.Dispatch<React.SetStateAction<User | null>>;
}
export interface LoginFormProps {
  setLoggedUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export interface Message {
  messageId?: number;
  roomName?: string;
  message: string;
  createdAt?: string;
  userId?: number;
  userName: string | null;
}

export interface Room {
  roomId?: number;
  roomName: string;
  isPrivate: boolean;
  users?: User[];
}
