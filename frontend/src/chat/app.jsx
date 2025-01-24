import React, { useState } from 'react';
import LeftSideBar from './LeftSideBar.jsx';
import ChatWindow from './middle/chatWindow.jsx';
import RightSidebar from './sidebar-right/RightSidebar';
import './App.css';

const App = () => {
    const [currentChannel, setCurrentChannel] = useState(null);
    const [channelMembers, setChannelMembers] = useState([]);

    const profile = {
        name: "Bellinna",
        avatar: "https://via.placeholder.com/80",
    };

    return (
        <div className="app-container">
            <LeftSideBar 
                onChannelChange={setCurrentChannel} 
                onMembersChange={setChannelMembers}
            />
            <ChatWindow currentChannel={currentChannel} />
            <RightSidebar 
                profile={profile} 
                members={channelMembers} 
            />
        </div>
    );
};

export default App;
