import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import MembersSection from './sidebar-right/members';

const LeftSideBar = ({ onChannelChange, onMembersChange }) => {
    const [joinedChannels, setJoinedChannels] = useState([]);
    const [socket, setSocket] = useState(null);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [channelMembers, setChannelMembers] = useState([]);
    const [userAvatar, setUserAvatar] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            auth: {
                token: localStorage.getItem('token'),
            }
        });
        setSocket(newSocket);

        newSocket.on('response', (response) => {
            if (response.action === 'join') {
                setJoinedChannels(prev => [...prev, response.data]);
                onChannelChange(response.data);
                // Demander la liste des membres
                newSocket.emit('input', {
                    data: `/members ${response.data}`,
                    timestamp: new Date().toISOString(),
                });
            } else if (response.action === 'quit') {
                setJoinedChannels(prev => prev.filter(channel => channel !== response.data));
            } else if (response.action === 'members') {
                setChannelMembers(response.data);
                onMembersChange(response.data);
            }
        });

        // Demander la liste des canaux rejoints au démarrage
        newSocket.emit('input', {
            data: '/channels',
            timestamp: new Date().toISOString(),
        });

        // Récupérer l'avatar depuis le localStorage d'abord
        const savedAvatar = localStorage.getItem('avatarParts');
        if (savedAvatar) {
            setUserAvatar(JSON.parse(savedAvatar));
        }

        // Demander l'avatar au serveur
        newSocket.emit('get-avatar');
        newSocket.on('avatar-data', (response) => {
            if (response.success) {
                setUserAvatar(response.avatarData);
                localStorage.setItem('avatarParts', JSON.stringify(response.avatarData));
            }
        });

        return () => newSocket.disconnect();
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
            <div className="user-profile">
                <div className="avatar-container-small">
                    {userAvatar && Object.entries(userAvatar).map(([part, index]) => (
                        <img 
                            key={part}
                            className="avatar-image"
                            src={`../../public/avatars/${part}${index}.png`}
                            alt={part}
                        />
                    ))}
                </div>
                <span>{localStorage.getItem('username')}</span>
            </div>
            <h3>My channels</h3>
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
    );
};

export default LeftSideBar;
