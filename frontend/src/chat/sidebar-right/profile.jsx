import React from 'react';
import './RightSidebar.css';

const ProfileSection = ({ username, name }) => (
    <div className="profile-section">
        <h3 className="name">{username}</h3>
    </div>
);

export default ProfileSection;
