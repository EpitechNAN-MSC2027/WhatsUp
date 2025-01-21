import React, { useState } from 'react';
import LeftSideBar from './LeftSideBar.jsx';
import ChatWindow from './middle/chatWindow.jsx';
import RightSidebar from './sidebar-right/RightSidebar'; // Importez RightSidebar
import './App.css';

const App = () => {
    const [selectedTeam, setSelectedTeam] = useState(null);

    const teams = [
        { id: 1, name: "Team A" },
        { id: 2, name: "Team B" },
        { id: 3, name: "Team C" },
    ];

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
            <LeftSideBar teams={teams} onTeamSelect={setSelectedTeam} />
            <ChatWindow selectedTeam={selectedTeam} />
            <RightSidebar profile={profile} members={members} />
        </div>
    );
};

export default App;
