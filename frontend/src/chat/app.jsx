import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar.jsx";
import ChatWindow from "./middle/chatWindow.jsx";
import RightSidebar from "./sidebar-right/RightSidebar";
import "./App.css";

const App = () => {
    const [teams, setTeams] = useState([]); // Remplacez les constantes locales
    const [selectedTeam, setSelectedTeam] = useState(null);

    const profile = {
        name: "Bellinna",
        avatar: "https://via.placeholder.com/80",
    };

    const members = [
        { name: "Alice" },
        { name: "Bob" },
        { name: "Charlie" },
    ];

    // Récupérer les channels au chargement
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/channels");
                if (!response.ok) throw new Error("Failed to fetch channels");
                const data = await response.json();
                setTeams(data); // Met à jour l'état avec les données récupérées
            } catch (error) {
                console.error("Error fetching channels:", error);
            }
        };

        fetchChannels();
    }, []); // Effectué une seule fois au montage

    const handleAddTeam = async (newChannelName) => {
        try {
            const response = await fetch("http://localhost:3000/api/channels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channelName: newChannelName }), // Utilisez channelName
            });

            if (!response.ok) throw new Error("Failed to add channel");
            const newChannel = await response.json();
            setTeams((prevTeams) => [...prevTeams, newChannel]); // Ajoute le nouveau channel
        } catch (error) {
            console.error("Error adding channel:", error);
        }
    };


    return (
        <div className="app-container">
            <Sidebar teams={teams} onTeamSelect={setSelectedTeam} onAddTeam={handleAddTeam} />
            <ChatWindow selectedTeam={selectedTeam} />
            <RightSidebar profile={profile} members={members} />
        </div>
    );
};

export default App;
