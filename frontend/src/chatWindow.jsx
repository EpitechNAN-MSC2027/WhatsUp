import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import commands from './commands';

const ChatWindow = ({ selectedTeam }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]); // Messages reçus du serveur
    const [input, setInput] = useState(""); // Message à envoyer
    const [commandSuggestions, setCommandSuggestions] = useState([]); // Suggestions de commandes

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
            socket.emit('input', input);
            setInput('');
            setCommandSuggestions([]);
        }
    };

    const handleInputChange = (e) => {
        const userInput = e.target.value;
        setInput(userInput);

        if (userInput.startsWith('/')) {
            const commandPrefix = userInput.slice(1).toLowerCase();
            const suggestions = Object.keys(commands)
                .filter(command => command.startsWith(commandPrefix))
                .map(command => command);
            setCommandSuggestions(suggestions);
        } else {
            setCommandSuggestions([]);
        }
    };

    const handleSuggestionClick = (command) => {
        setInput(`/${command}`); // Remplit l'input avec la commande sélectionnée
        setCommandSuggestions([]);
    };

    return (
        <div className="chat-window">
            {selectedTeam ? (
                <>
                    <h2>{selectedTeam.name} - Chat</h2>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className="message">
                                {/* Affichez les messages ou réponses */}
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
                            onChange={handleInputChange}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                        {commandSuggestions.length > 0 && (
                            <div className="command-suggestions">
                                <ul>
                                    {commandSuggestions.map((command, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleSuggestionClick(command)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {command} - {commands[command]}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <p>Please select a team to view and send messages.</p>
            )}
        </div>
    );
};

export default ChatWindow;
