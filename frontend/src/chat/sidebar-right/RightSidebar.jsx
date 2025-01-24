import React from 'react';
import './RightSidebar.css';
import ProfileSection from './profile';
import MembersSection from './members';
import avatarGif from './avatar.gif';

const RightSidebar = ({ profile, members }) => {
    const username = localStorage.getItem('username');
    
    return (
        <div className="right-sidebar">
            <ProfileSection 
                username={username || 'Utilisateur'} 
                name={profile?.name}
            />
            <img src={avatarGif} alt="Divider GIF" className="avatar"/>
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
        </div>
    );
};

export default RightSidebar;
