import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSideBar from './LeftSideBar.jsx';
import ChatWindow from './middle/chatWindow.jsx';
import RightSidebar from './sidebar-right/RightSidebar';
import './App.css';

const App = () => {
    const [currentChannel, setCurrentChannel] = useState(null);
    const [channelMembers, setChannelMembers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Vérifier si un token existe au chargement
        const token = localStorage.getItem('token');
        if (!token) {
            // Si pas de token, rediriger vers la page de connexion
            navigate('/login');
        } else {
            setIsConnected(true);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsConnected(false);
        navigate('/login');
    };

    // Si l'utilisateur n'est pas connecté, ne rien afficher pendant la redirection
    if (!isConnected) {
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
            />
            <ChatWindow currentChannel={currentChannel} />
            <RightSidebar 
                profile={profile} 
                members={channelMembers} 
            />
        </div>
    );
};

export default App;
