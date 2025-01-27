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

        // Écoute des channels
        newSocket.on('channels', (userChannels) => {
            console.log('Channels reçus dans LeftSideBar:', userChannels);
            setJoinedChannels(userChannels);
        });

        // Écoute des réponses
        newSocket.on('response', async (response) => {
            console.log('Response received:', response);
            if (response.action === 'join' && response.status === 'success') {
                // Mise à jour locale immédiate
                setJoinedChannels(prev => {
                    if (!prev.includes(response.data)) {
                        return [...prev, response.data];
                    }
                    return prev;
                });
                onChannelChange(response.data);
                
                // Demander une mise à jour des channels
                newSocket.emit('input', {
                    data: '/channels',
                    timestamp: new Date().toISOString(),
                });
            } 
            else if (response.action === 'create' && response.status === 'success') {
                // Rafraîchissement automatique de la page
                window.location.reload();
            } 
            else if (response.action === 'quit') {
                setJoinedChannels(prev => prev.filter(channel => channel !== response.data));
                
                // Demander une mise à jour des channels
                newSocket.emit('input', {
                    data: '/channels',
                    timestamp: new Date().toISOString(),
                });
            } 
            else if (response.action === 'members') {
                setChannelMembers(response.data);
                onMembersChange(response.data);
            }
        });

        // Demande initiale des channels
        newSocket.emit('input', {
            data: '/channels',
            timestamp: new Date().toISOString(),
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
