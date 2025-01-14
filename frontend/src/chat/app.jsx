import React, { useState } from 'react';
import Sidebar from './sidebar.jsx';
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
        name: "John Doe",
        avatar: "https://via.placeholder.com/80", // URL de l'avatar
    };

    const members = [
        { name: "Alice", avatar: "https://via.placeholder.com/40" },
        { name: "Bob", avatar: "https://via.placeholder.com/40" },
        { name: "Charlie", avatar: "https://via.placeholder.com/40" },
    ];

    return (
        <div className="app-container">
            <Sidebar teams={teams} onTeamSelect={setSelectedTeam} />
            <ChatWindow selectedTeam={selectedTeam} />
            <RightSidebar profile={profile} members={members} /> {/* Ajoutez RightSidebar */}
        </div>
    );
};

export default App;
