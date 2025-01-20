import React from 'react';
import './RightSidebar.css';

const ProfileSection = ({ name, avatar }) => (
    <div className="profile-section">
        <h3 className="name">{name}</h3>
    </div>
);

export default ProfileSection;
