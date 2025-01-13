import React from "react";

const Sidebar = ({ teams, onTeamSelect }) => {
    return (
        <div className="sidebar">
            <h3>Your channels</h3>
            <ul>
                {teams.map((team) => (
                    <li key={team.id} onClick={() => onTeamSelect(team)}>
                        {team.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
