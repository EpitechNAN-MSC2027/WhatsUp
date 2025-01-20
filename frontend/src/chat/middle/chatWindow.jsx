import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import commands from './commands.jsx';
import EmojiPickerComponent from "./emoji.jsx";

const ChatWindow = ({ selectedTeam }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]); // Messages reçus du serveur
    const [input, setInput] = useState(""); // Message à envoyer
    const [commandSuggestions, setCommandSuggestions] = useState([]); // Suggestions de commandes

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server:', newSocket.id);
        });

        newSocket.on('response', (response) => {
            console.log('Response from server:', response);
            setMessages((prevMessages) => [...prevMessages, response]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleSendMessage = () => {
        if (input.trim() && socket) {
            socket.emit('input', {
                data: input
            });
            setInput(''); // Réinitialiser l'entrée
            setCommandSuggestions([]); // Réinitialiser les suggestions de commandes
        }
    };

    const handleInputChange = (e) => {
        const userInput = e.target.value;
        setInput(userInput);

        // Gérer les suggestions de commandes si l'utilisateur tape "/"
        if (userInput.startsWith('/')) {
            const commandPrefix = userInput.slice(1).toLowerCase();
            const suggestions = Object.keys(commands)
                .filter(command => command.startsWith(commandPrefix))
                .map(command => command);
            setCommandSuggestions(suggestions);
        } else {
            setCommandSuggestions([]); // Réinitialise les suggestions si ce n'est pas une commande
        }
    };

    const handleSuggestionClick = (command) => {
        setInput(`/${command}`);
        setCommandSuggestions([]); // Fermer les suggestions après la sélection
    };

    // Gestion de la sélection d'émojis
    const handleEmojiSelect = (emoji) => {
        setInput((prevInput) => prevInput + emoji); // Ajoute l'émoji au texte
    };

    // Gérer l'envoi du message lorsque la touche Entrée est pressée
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Empêche le comportement par défaut (saut de ligne)
            handleSendMessage(); // Envoie le message
        }
    };

    return (
        <div className="chat-window">
            {selectedTeam ? (
                <>
                    <h2>{selectedTeam.name} - Chat</h2>
                    <div className="messages">
                        {messages.length === 0 ? (
                            <p>No messages yet. Try sending a command like /list</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="message">
                                    {msg.type === "list" ? (
                                        <div>
                                            <strong>Channels:</strong>
                                            <ul>
                                                {msg.channels.map((channels, idx) => (
                                                    <li key={idx}>{channels}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        msg.text || msg.message || "Message inconnu"
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="message-input">
                        <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
                        <input
                            type="text"
                            placeholder="Type a message, e.g., /list or Hello!"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown} // Ajout de l'écouteur pour la touche Entrée
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
                <>
                    <h2>Welcome to the Chat</h2>
                    <p>To get started, select a team to view the chat.</p>
                    <p>Or type a command like <code>/list</code> to view available channels.</p>
                    <div className="messages">
                        {messages.length === 0 ? (
                            <p>No messages yet. Type a command to interact.</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="message">
                                    {msg.text || msg.message || "Message inconnu"}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="message-input">
                        <input
                            type="text"
                            placeholder="Type a command like /list"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown} // Ajout de l'écouteur pour la touche Entrée
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatWindow;