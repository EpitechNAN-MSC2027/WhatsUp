import React, { useState } from "react";

const Sidebar = ({ teams, onTeamSelect, onAddTeam }) => {
    const [newChannelName, setNewChannelName] = useState("");

    const handleAddChannel = () => {
        if (newChannelName.trim() !== "") {
            onAddTeam(newChannelName);
            setNewChannelName(""); // Réinitialise le champ
        }
    };

    return (
        <div className="sidebar">
            <h3>Your channels</h3>
            <ul>
                {teams.map((team, index) => (
                    <li key={index} onClick={() => onTeamSelect(team)}>
                        {team.channelName} {/* Utilisez channelName pour correspondre au backend */}
                    </li>
                ))}
            </ul>

            <div className="add-channel">
                <input
                    type="text"
                    placeholder="New channel"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                />
                <button onClick={handleAddChannel}>Add</button>
            </div>
        </div>
    );
};

export default Sidebar;
