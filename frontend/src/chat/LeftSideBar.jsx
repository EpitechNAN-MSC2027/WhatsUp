import React, { useState } from "react";

const LeftSideBar = ({ teams, onTeamSelect, onAddTeam }) => {
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
                        {team.channelName}
                    </li>
                ))}
            </ul>

        </div>
    );
};

export default LeftSideBar;
