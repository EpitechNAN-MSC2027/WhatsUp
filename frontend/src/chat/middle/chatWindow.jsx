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
const ChatWindow = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [commandSuggestions, setCommandSuggestions] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [channels, setChannels] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            auth: {
                token: localStorage.getItem('token'),
            }
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server:', newSocket.id);
        });

        // Écoute des messages du canal
        newSocket.on('message', (messageData) => {
            console.log('Message received:', messageData);
            if (messageData.channel === currentChannel) {
                setMessages(prevMessages => [...prevMessages, {
                    text: messageData.message,
                    sender: messageData.sender,
                    type: 'received'
                }]);
            }
        });

        newSocket.on('channelMessage', (messageData) => {
            console.log('Channel message received:', messageData);
            if (messageData.channel === currentChannel) {
                setMessages(prevMessages => [...prevMessages, {
                    text: messageData.message,
                    sender: messageData.sender,
                    type: 'received'
                }]);
            }
        });

        newSocket.on('response', (response) => {
            console.log('Response from server:', response);
            const { output, data } = handleCommand(response);
            
            if (response.action === 'list' && response.status === 'success') {
                setChannels(response.data);
                setMessages(prev => [...prev, {
                    text: output,
                    type: 'system',
                    action: 'list',
                    channels: response.data
                }]);
            } else {
                setMessages(prev => [...prev, {
                    text: output,
                    type: 'system'
                }]);
            }

            if (response.action === 'join' && response.status === 'success') {
                setCurrentChannel(response.data.name || response.data);
                setMessages([]); // Réinitialiser les messages lors du changement de canal
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [currentChannel]);

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

        if (input.startsWith('/')) {
            socket.emit('input', {
                data: input,
                timestamp: new Date().toISOString(),
            });
        } else if (currentChannel) {
            // Envoi du message dans le canal
            socket.emit('message', {
                message: input,
                channel: currentChannel,
                timestamp: new Date().toISOString()
            });

            // Affichage local du message envoyé
            setMessages(prev => [...prev, {
                text: input,
                sender: 'Vous',
                type: 'sent'
            }]);
        }

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
                <h2>{currentChannel ? `Canal: ${currentChannel.name || currentChannel}` : 'Chat'} </h2>
            </div>
            <div className="messages" style={{overflowY: 'auto', height: '60vh'}}>
                {messages.map((msg, index) => (
                    <div key={index} 
                         className={`message ${msg.type || 'received'}`}>
                        {msg.action === 'list' ? (
                            <div className="channel-list-message">
                                <strong>Channels :</strong>
                                <ul>
                                    {msg.channels.map((channel, idx) => (
                                        <li key={idx}>{channel}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : msg.sender ? (
                            <>
                                <span className="message-sender">{msg.sender}: </span>
                                <span className="message-text">{msg.text}</span>
                            </>
                        ) : (
                            msg.text
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