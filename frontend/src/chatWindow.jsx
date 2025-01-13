import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatWindow = ({ selectedTeam }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]); // Messages reçus du serveur
    const [input, setInput] = useState("");  // Message à envoyer

    useEffect(() => {
        if (!selectedTeam) return;  // Si aucune équipe sélectionnée, ne rien faire

        // Connecter le socket
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        // Log connection status
        newSocket.on('connect', () => {
            console.log('Connected to server:', newSocket.id);
        });

        // Listen for server responses
        newSocket.on('response', (data) => {
            console.log('Response from server:', data);
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [selectedTeam]);

    const handleSendMessage = () => {
        if (input.trim() && socket) {
            socket.emit('input', input); // Envoi du message au serveur
            setInput(''); // Réinitialise le champ d'entrée
        }
    };

    return (
        <div className="chat-window">
            {selectedTeam ? (
                <>
                    <h3>{selectedTeam.name} - Chat</h3>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className="message">
                                {typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg}
                            </div>
                        ))}
                    </div>
                    <div className="message-input">
                        <input
                            type="text"
                            placeholder="Type a message, e.g., /list or Hello!"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </>
            ) : (
                <p>Please select a team to view and send messages.</p>
            )}
        </div>
    );
};

export default ChatWindow;
