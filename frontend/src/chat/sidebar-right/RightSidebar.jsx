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
            <MembersSection members={members}/>
        </div>
    );
};

export default RightSidebar;
