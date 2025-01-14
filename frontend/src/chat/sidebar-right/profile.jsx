import React from 'react';
import './RightSidebar.css';

const ProfileSection = ({ name, avatar }) => (
    <div className="profile-section">
        <img src={avatar} alt={`${name}'s avatar`} className="avatar" />
        <h3 className="name">{name}</h3>
    </div>
);

export default ProfileSection;
