import React, {useState} from 'react';
import './RightSidebar.css';
import ProfileSection from './profile';
import MembersSection from './members';
import avatarGif from './avatar.gif';

const RightSidebar = ({ profile, members }) => {
    const username = localStorage.getItem('username');

    console.log('members:', members);
    
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
                    {Array.isArray(members) ? members.map((member, index) => (
                        <li key={index} className="member-item">
                            <span
                                className={`status-dot ${member.isConnected ? 'online' : 'offline'}`}
                            />
                            <span>{member.user}</span>
                        </li>
                    )) : <p>No members available</p>}
                </ul>
            </div>
        </div>
    );
};

export default RightSidebar;
