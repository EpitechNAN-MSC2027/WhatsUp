import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import MembersSection from './sidebar-right/members';

const LeftSideBar = ({ onChannelChange, onMembersChange, onLogout, socket, currentChannel }) => {
    const [joinedChannels, setJoinedChannels] = useState([]);
    const [channelMembers, setChannelMembers] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

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

        /*
        // Écoute des réponses
        socket.on('response', async (response) => {
            console.log('Response received in LeftSideBar:', response);
            if (response.action === 'join' && response.status === 'success') {
                setJoinedChannels(prev => {
                    if (!prev.includes(response.data)) {
                        return [...prev, response.data];
                    }
                    return prev;
                });


                onChannelChange(response.data);
            }
            else if (response.action === 'create' && response.status === 'success') {
                window.location.reload();
            } 
            else if (response.action === 'quit') {
                setJoinedChannels(prev => prev.filter(channel => channel !== response.data));
            } 
            else if (response.action === 'members') {
                setChannelMembers(response.data);
                onMembersChange(response.data);
            }
        });

         */

        /*
        // Demande initiale des channels
        socket.emit('input', {
            data: '/channels',
            timestamp: new Date().toISOString(),
        });
         */

        return () => {
            socket.off('channels');
            socket.off('response');
        };
    }, [socket, onChannelChange, onMembersChange]);

    const handleChannelClick = (channel) => {
        socket.emit('input', {
            data: `/join ${channel}`,
            timestamp: new Date().toISOString(),
        });
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
                        onClick={() => handleThemeChange('theme-dark')}
                    >
                        Dark Theme
                    </button>
                    <button 
                        className="theme-button"
                        onClick={() => handleThemeChange('theme-nature')}
                    >
                        Nature Theme
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
