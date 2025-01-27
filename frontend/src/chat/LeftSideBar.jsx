import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import MembersSection from './sidebar-right/members';

const LeftSideBar = ({ onChannelChange, onMembersChange, onLogout }) => {
    const [joinedChannels, setJoinedChannels] = useState([]);
    const [socket, setSocket] = useState(null);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [channelMembers, setChannelMembers] = useState([]);

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            auth: {
                token: localStorage.getItem('token'),
            },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });
        
        setSocket(newSocket);

        // Demander la liste des channels au démarrage
        newSocket.emit('input', {
            data: '/channels',
            timestamp: new Date().toISOString(),
        });

        newSocket.on('channels', (userChannels) => {
            console.log('Channels reçus dans LeftSideBar:', userChannels);
            setJoinedChannels(userChannels);
        });

        newSocket.on('response', (response) => {
            console.log('Response received:', response);
            if (response.action === 'join' && response.status === 'success') {
                // Mettre à jour la liste des channels
                newSocket.emit('input', {
                    data: '/channels',
                    timestamp: new Date().toISOString(),
                });
                onChannelChange(response.data);
            } else if (response.action === 'create' && response.status === 'success') {
                // Mettre à jour la liste des channels
                newSocket.emit('input', {
                    data: '/channels',
                    timestamp: new Date().toISOString(),
                });
                onChannelChange(response.data);
            } else if (response.action === 'quit') {
                setJoinedChannels(prev => prev.filter(channel => channel !== response.data));
            } else if (response.action === 'members') {
                setChannelMembers(response.data);
                onMembersChange(response.data);
            }
        });

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [onChannelChange, onMembersChange]);

    const handleChannelClick = (channel) => {
        setCurrentChannel(channel);
        onChannelChange(channel);
        socket.emit('input', {
            data: `/members ${channel}`,
            timestamp: new Date().toISOString(),
        });
    };

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
            <button onClick={onLogout} className="logout-button">
                Log out
            </button>
        </div>
    );
};

export default LeftSideBar;
