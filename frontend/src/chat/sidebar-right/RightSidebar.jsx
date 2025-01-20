import React from 'react';
import './RightSidebar.css';
import ProfileSection from './profile';
import MembersSection from './members';
import avatarGif from './avatar.gif';

const RightSidebar = ({ profile, members }) => (
    <div className="right-sidebar">
        <ProfileSection name={profile.name}/>
        <img src={avatarGif} alt="Divider GIF" class={"avatar"}/>
        <MembersSection members={members}/>
    </div>
);

export default RightSidebar;
