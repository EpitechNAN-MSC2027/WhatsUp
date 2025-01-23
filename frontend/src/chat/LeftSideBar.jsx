import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const LeftSideBar = () => {
    const [joinedChannels, setJoinedChannels] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            auth: {
                token: localStorage.getItem('token'),
            }
        });
        setSocket(newSocket);

        // Écouter les mises à jour des canaux
        newSocket.on('response', (response) => {
            if (response.action === 'join') {
                setJoinedChannels(prev => [...prev, response.data]);
            } else if (response.action === 'quit') {
                setJoinedChannels(prev => prev.filter(channel => channel !== response.data));
            }
        });

        // Demander la liste des canaux rejoints au démarrage
        newSocket.emit('input', {
            data: '/channels',
            timestamp: new Date().toISOString(),
        });

        return () => newSocket.disconnect();
    }, []);

    return (
        <div className="sidebar">
            <h3>My channels</h3>
            <ul className="channel-list">
                {joinedChannels.map((channel, index) => (
                    <li key={index} className="channel-item">
                        # {channel}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LeftSideBar;
