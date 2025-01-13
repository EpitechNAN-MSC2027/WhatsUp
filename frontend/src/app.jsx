import React, { useState } from "react";
import Sidebar from "./sidebar";
import ChatWindow from "./chatWindow";
import "./App.css";

const App = () => {
    const [selectedTeam, setSelectedTeam] = useState(null);

    const teams = [
        { id: 1, name: "Team A" },
        { id: 2, name: "Team B" },
        { id: 3, name: "Team C" },
    ];

    return (
        <div className="app-container">
            <Sidebar teams={teams} onTeamSelect={setSelectedTeam} />
            <ChatWindow selectedTeam={selectedTeam} />
        </div>
    );
};

export default App;
