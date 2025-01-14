import React from 'react';
import './RightSidebar.css';
import ProfileSection from './profile';
import MembersSection from './members';

const RightSidebar = ({ profile, members }) => (
    <div className="right-sidebar">
        <ProfileSection name={profile.name}  />
        <MembersSection members={members} />
    </div>
);

export default RightSidebar;
