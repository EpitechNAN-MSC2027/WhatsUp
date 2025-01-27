import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import LeftSideBar from './LeftSideBar.jsx';
import ChatWindow from './middle/chatWindow.jsx';
import RightSidebar from './sidebar-right/RightSidebar';
import './App.css';

const App = () => {
    const [currentChannel, setCurrentChannel] = useState(null);
    const [channelMembers, setChannelMembers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            setIsConnected(true);
            const newSocket = io('http://localhost:3000', {
                auth: {
                    token: token,
                },
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
            });
            setSocket(newSocket);

            return () => {
                if (newSocket) newSocket.disconnect();
            };
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsConnected(false);
        navigate('/login');
    };

    if (!isConnected || !socket) {
        return null;
    }

    const profile = {
        name: localStorage.getItem('username') || "User",
        avatar: "https://via.placeholder.com/80",
    };

    return (
        <div className="app-layout">
            <LeftSideBar 
                onChannelChange={setCurrentChannel} 
                onMembersChange={setChannelMembers}
                onLogout={handleLogout}
                socket={socket}
                currentChannel={currentChannel}
            />
            <ChatWindow 
                currentChannel={currentChannel}
                socket={socket}
            />
            <RightSidebar 
                profile={profile} 
                members={channelMembers} 
            />
        </div>
    );
};

export default App;
