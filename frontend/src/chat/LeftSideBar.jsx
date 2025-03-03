import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import MembersSection from './sidebar-right/members';

const LeftSideBar = ({ onChannelChange, onMembersChange, onLogout, socket, currentChannel }) => {
    const [joinedChannels, setJoinedChannels] = useState([]);
    const [channelMembers, setChannelMembers] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [userAvatar, setUserAvatar] = useState(null);

    useEffect(() => {
        if (!socket) return;

        // Écoute des channels
        socket.on('channels', (userChannels) => {
            console.log('Channels reçus dans LeftSideBar:', userChannels);
            setJoinedChannels(userChannels);
        });

        socket.on('channel', (channel) => {
            console.log('Current channel:', channel);
            onChannelChange(channel);
        });

        socket.on('users', (members) => {
            console.log('Current members:', members);
            onMembersChange(members);
        })

        return () => {
            socket.off('channels');
            socket.off('response');
        };
    }, [socket, onChannelChange, onMembersChange]);

    useEffect(() => {
        const username = localStorage.getItem('username');
        const savedAvatar = localStorage.getItem(`avatar_${username}`);
        if (savedAvatar) {
            setUserAvatar(JSON.parse(savedAvatar));
        }
    }, []);

    const handleChannelClick = (channel) => {
        socket.emit('move', channel);
    };

    const handleThemeChange = (theme) => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
        setShowSettings(false);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'theme-original';
        document.body.className = savedTheme;
    }, []);

    return (
        <div className="sidebar">
            <div className="user-profile">
                {userAvatar && (
                    <div className="avatar-container-small">
                        {Object.keys(userAvatar).map(part => (
                            <img
                                key={part}
                                className="avatar-image"
                                src={part === 'clothes' ? 
                                    `/avatars/outfit${userAvatar[part]}.png` : 
                                    `/avatars/${part}${userAvatar[part]}.png`}
                                alt={part}
                            />
                        ))}
                    </div>
                )}
            </div>
            <h3>My channels</h3>
            <div className="channels-container">
                <ul className="channel-list">
                    {joinedChannels.map((channel, index) => (
                        <li 
                            key={index} 
                            className={`channel-item ${channel === currentChannel ? 'active' : ''}`}
                            onClick={() => handleChannelClick(channel)}
                        >
                            # {channel}
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={() => setShowSettings(true)} className="settings-button">
                Settings
            </button>
            <button onClick={onLogout} className="logout-button">
                Log out
            </button>

            {showSettings && (
                <div className="settings-panel">
                    <h3>Choose Theme</h3>
                    <button 
                        className="theme-button"
                        onClick={() => handleThemeChange('theme-original')}
                    >
                        Original Theme
                    </button>
                    <button 
                        className="theme-button"
                        onClick={() => handleThemeChange('theme-neon')}
                    >
                        Night Theme
                    </button>
                    <button 
                        className="theme-button"
                        onClick={() => handleThemeChange('theme-cyber')}
                    >
                        Coffee Theme
                    </button>
                    <button 
                        className="theme-button"
                        onClick={() => setShowSettings(false)}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeftSideBar;
