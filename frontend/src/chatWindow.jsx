import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatWindow = ({ selectedTeam }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]); // Messages reçus du serveur
    const [input, setInput] = useState("");  // Message à envoyer

    useEffect(() => {
        if (!selectedTeam) return;
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server:', newSocket.id);
        });

        newSocket.on('response', (data) => {
            console.log('Response from server:', data);
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [selectedTeam]);

    const handleSendMessage = () => {
        if (input.trim() && socket) {
            socket.emit('input', input); // Envoi du message au serveur
            setInput('');
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
                                {/* Si la réponse est une liste de canaux */}
                                {msg.type === "list" ? (
                                    <div>
                                        <strong>Channels:</strong>
                                        <ul>
                                            {msg.channels.map((channel, idx) => (
                                                <li key={idx}>{channel}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    // Si c'est un message normal, on affiche simplement le texte
                                    msg.text ? msg.text : msg.message || "Message inconnu"
                                )}
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
