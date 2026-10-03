import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import WelcomeChat from './pages/WelcomeChat';
import SocketCtxWrapper from './context/SocketCtxWrapper';
import { useState } from 'react';
// import RoomChat from './pages/RoomChat';
import UserLoginForm from './components/UserLoginForm';
import UserRegisterForm from './components/UserRegisterForm';
import { User } from './Interfaces/Interfaces';
import Header_bar from './components/Header_bar';
import NotFound from './components/NotFound';

function App() {
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  return (
    <div className="App">
      <Header_bar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/gatochat/login" />} />
          <Route
            path="/gatochat/login"
            element={<UserLoginForm setLoggedUser={setLoggedUser} />}
          />
          <Route
            path="/gatochat/register"
            element={<UserRegisterForm setLoggedUser={setLoggedUser} />}
          />
          <Route
            path="/chat/:currentRoom"
            element={
              loggedUser ? (
                <SocketCtxWrapper loggedUser={loggedUser}>
                  <WelcomeChat />
                </SocketCtxWrapper>
              ) : (
                <Navigate to="/gatochat/login" />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
