import React from 'react';
import LeftSideBar from './LeftSideBar.jsx';
import ChatWindow from './middle/chatWindow.jsx';
import RightSidebar from './sidebar-right/RightSidebar';
import './App.css';

const App = () => {
    const profile = {
        name: "Bellinna",
        avatar: "https://via.placeholder.com/80",
    };

    const members = [
        { name: "Alice"},
        { name: "Bob"},
        { name: "Charlie"},
    ];

    return (
        <div className="app-container">
            <LeftSideBar />
            <ChatWindow />
            <RightSidebar profile={profile} members={members} />
        </div>
    );
};

export default App;
