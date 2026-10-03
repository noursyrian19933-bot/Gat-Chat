/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from 'react';
import { Socket } from 'socket.io-client';

// State types
export interface ISocketContext {
  socket: Socket | undefined;
  userInfos: string;
}

export interface IReducerActions {
  type: 'update_socket' | 'update_userInfos' | 'remove_user';
  payload: string | string[] | Socket | null;
}

export const reducerFunction = (
  state: ISocketContext,
  action: IReducerActions
): ISocketContext => {
  if (action.type === 'update_socket') {
    // payload is a socket object
    return { ...state, socket: action.payload as Socket };
  }
  if (action.type === 'update_userInfos') {
    return { ...state, userInfos: action.payload as string };
  }
  return state;
};

// ### CREATE THE CONTEXT ### //
export interface ISocketContextProps {
  appState: ISocketContext;
  dispatch: React.Dispatch<IReducerActions>;
}

export const initialSocketContext: ISocketContext = {
  socket: undefined,
  userInfos: '',
};

export const SocketContext = createContext<ISocketContextProps>({
  appState: initialSocketContext,
  dispatch: () => {},
});

export const SocketContextProvider = SocketContext.Provider;
