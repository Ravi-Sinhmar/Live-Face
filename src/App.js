import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartMeet from "./Components/StartMeet";
import JoinMeet from "./Components/JoinMeet";
import FriendProvider from './Contexts/Friend';
import PeerProvider from './Contexts/Peer';
import { SocketProvider } from './Contexts/Socket';
import "./App.css";
import "./index.css";

function App() {
  return (
    <FriendProvider>
      <PeerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<StartMeet />} />
            <Route
              path="/meeting"
              element={
                <SocketProvider>
                  <JoinMeet />
                </SocketProvider>
              }
            />
          </Routes>
        </Router>
      </PeerProvider>
    </FriendProvider>
  );
}

export default App;
