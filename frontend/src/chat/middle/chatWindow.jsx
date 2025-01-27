import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import commands from './commands.jsx';
import EmojiPickerComponent from './emoji.jsx';
import { handleCommand } from './responseHandler.jsx';

/**
 *
 * @param selectedTeam
 * @returns {Element}
 * @constructor
 */
const ChatWindow = ({ currentChannel, socket }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [commandSuggestions, setCommandSuggestions] = useState([]);
    const [channels, setChannels] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('channel', (channel) => {
            console.log('Current channel:', channel);
        });

        socket.on('history', (history) => {
            console.log('Messages history received:', history);
            const formattedHistory = history.map(msg => ({
                text: msg,
                sender: msg.split(':')[0],
                message: msg.split(':')[1],
                type: 'received'
            }));
            setMessages(formattedHistory);
        });

        socket.on('message', (messageData) => {
            console.log('Message reçu:', messageData);
            setMessages(prevMessages => [...prevMessages, {
                text: messageData,
                sender: messageData.split(':')[0],
                message: messageData.split(':')[1],
                type: 'received'
            }]);
        });

        socket.on('response', (response) => {
            console.log('Response from server:', response);
            
            if (response.action === 'join' && response.status === 'success') {
                // L'historique sera reçu via l'événement 'history'
            } else if (response.action === 'list' && response.status === 'success') {
                setChannels(response.data);
                setMessages(prev => [...prev, {
                    text: 'Channels :',
                    type: 'system',
                    channels: response.data
                }]);
            }
        });

        return () => {
            socket.off('message');
            socket.off('response');
            socket.off('history');
            socket.off('channel');
        };
    }, [socket]);

    //Fonction pour gérer le défilement
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Défilement automatique chaque fois que les messages changent
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!input.trim() || !socket) return;

        // Envoyer le message au serveur
        socket.emit('input', {
            data: input,
            timestamp: new Date().toISOString()
        });

        // Ne pas afficher localement le message, attendre la confirmation du serveur
        setInput('');
        setCommandSuggestions([]);
    };


    const handleInputChange = (e) => {
        const userInput = e.target.value;
        setInput(userInput);

        // Gérer les suggestions de commandes si l'utilisateur tape "/"
        if (userInput.startsWith('/')) {
            const commandPrefix = userInput.slice(1).toLowerCase();
            const suggestions = Object.keys(commands)
                .filter((command) => command.startsWith(commandPrefix))
                .map((command) => command);
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
            <div className="chat-header">
                <h2>{currentChannel ? `${currentChannel}` : 'general'}</h2>
            </div>
            <div className="messages" style={{overflowY: 'auto', height: '60vh'}}>
                {messages && messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type || 'received'}`}>
                        {msg.channels ? (
                            <div className="channel-list-message">
                                <strong>{msg.text}</strong>
                                <ul>
                                    {msg.channels.map((channel, idx) => (
                                        <li key={idx}>{channel}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : msg.sender ? (
                            <>
                                <span className="message-sender">{msg.sender} : </span>
                                <span className="message-text">{msg.message}</span>
                            </>
                        ) : (
                            <span className="message-text">{msg.text}</span>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
                <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
                <input
                    type="text"
                    placeholder={currentChannel 
                        ? "Type a message, e.g., /list or Hello!" 
                        : "Use /list to view available channels or /join <channel> to join a channel"}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
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
        </div>
    );
};

export default ChatWindow;