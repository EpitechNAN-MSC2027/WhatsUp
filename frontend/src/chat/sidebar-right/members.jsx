import React from 'react';
import './RightSidebar.css';

const MembersSection = ({ members }) => (
    <div className="members-section">
        <h4>Membres</h4>
        <ul>
            {members.map((member, index) => (
                <li key={index} className="member-item">
                    <span>{member.name}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default MembersSection;
