import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import commands from './commands.jsx';
import EmojiPickerComponent from './emoji.jsx';
import { handleCommand } from './responseHandler.jsx';
import SoundPlayer from './SoundPlayer'; // Importez le composant SoundPlayer

const ChatWindow = ({ currentChannel, socket }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [commandSuggestions, setCommandSuggestions] = useState([]);
    const [channels, setChannels] = useState([]);
    const [playJoinSound, setPlayJoinSound] = useState(false);
    const [playMessageSound, setPlayMessageSound] = useState(false);
    const [soundsEnabled, setSoundsEnabled] = useState(true); // État pour activer/désactiver les sons
    const [isTyping, setIsTyping] = useState(false); // État pour savoir si l'utilisateur est en train de taper
    const [typingUsers, setTypingUsers] = useState([]); // Liste des utilisateurs en train de taper
    const messagesEndRef = useRef(null);

    // Détecter quand l'utilisateur commence à taper
    useEffect(() => {
        let typingTimeout;

        if (input.trim()) {
            setIsTyping(true);
            // Émettre un événement "typing" au serveur
            socket.emit('typing', { user: localStorage.getItem('username'), channel: currentChannel });

            // Définir un délai pour détecter quand l'utilisateur a arrêté de taper
            typingTimeout = setTimeout(() => {
                setIsTyping(false);
                // Émettre un événement "stoppedTyping" au serveur
                socket.emit('stoppedTyping', { user: localStorage.getItem('username'), channel: currentChannel });
            }, 1000); // Délai de 1 seconde
        } else {
            setIsTyping(false);
            // Émettre un événement "stoppedTyping" au serveur
            socket.emit('stoppedTyping', { user: localStorage.getItem('username'), channel: currentChannel });
        }

        return () => clearTimeout(typingTimeout);
    }, [input, socket, currentChannel]);

    // Écouter les événements de saisie des autres utilisateurs
    useEffect(() => {
        if (!socket) return;

        socket.on('userTyping', (data) => {
            setTypingUsers((prev) => {
                if (!prev.includes(data.user)) {
                    return [...prev, data.user];
                }
                return prev;
            });
        });

        socket.on('userStoppedTyping', (data) => {
            setTypingUsers((prev) => prev.filter(user => user !== data.user));
        });

        return () => {
            socket.off('userTyping');
            socket.off('userStoppedTyping');
        };
    }, [socket]);

    // Afficher les utilisateurs en train de taper
    const typingIndicatorText = typingUsers.length > 0
        ? `${typingUsers.join(', ')} ${typingUsers.length > 1 ? 'are' : 'is'} typing...`
        : null;

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
            if (soundsEnabled) {
                console.log("Déclencher le son pour un nouveau message"); // Log pour déboguer
                setPlayMessageSound(true); // Jouer le son pour un nouveau message
            }
        });

        socket.on('userJoined', (nickname) => {
            console.log(`${nickname} a rejoint le canal`); // Log pour déboguer
            setMessages(prevMessages => [...prevMessages, {
                text: `${nickname} joined the channel :)`,
                type: 'system-notification',
                timestamp: new Date().toISOString()
            }]);
            if (soundsEnabled) {
                console.log("Déclencher le son pour un utilisateur qui rejoint"); // Log pour déboguer
                setPlayJoinSound(true); // Jouer le son pour un utilisateur qui rejoint
            }
        });

        socket.on('userLeft', (username) => {
            setMessages(prevMessages => [...prevMessages, {
                text: `${username} left the channel :(`,
                type: 'system-notification'
            }]);
            if (soundsEnabled) {
                console.log("Déclencher le son pour un utilisateur qui quitte"); // Log pour déboguer
                setPlayJoinSound(true); // Jouer le son pour un utilisateur qui rejoint
            }
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

        socket.on('private_message', (messageData) => {
            console.log('Message privé reçu:', messageData);
            const currentUsername = localStorage.getItem('username');
            const isFromMe = messageData.from === currentUsername;

            setMessages(prevMessages => [...prevMessages, {
                type: 'private',
                sender: messageData.from,
                receiver: messageData.to,
                content: messageData.content,
                isFromMe: isFromMe
            }]);
        });

        socket.on('userQuit', (username) => {
            setMessages(prevMessages => [...prevMessages, {
                text: `${username} quit the channel :(`,
                type: 'system-notification',
                timestamp: new Date().toISOString()
            }]);
        });

        return () => {
            socket.off('message');
            socket.off('response');
            socket.off('history');
            socket.off('channel');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('private_message');
            socket.off('userQuit');
        };
    }, [socket, soundsEnabled]);

    // Réinitialiser les sons après la lecture
    useEffect(() => {
        if (playJoinSound) {
            console.log("Réinitialiser le son pour un utilisateur qui rejoint"); // Log pour déboguer
            setPlayJoinSound(false);
        }
    }, [playJoinSound]);

    useEffect(() => {
        if (playMessageSound) {
            console.log("Réinitialiser le son pour un nouveau message"); // Log pour déboguer
            setPlayMessageSound(false);
        }
    }, [playMessageSound]);

    // Fonction pour gérer le défilement
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

        const privateMessageMatch = input.match(/^@(\w+)\s+(.+)/);
        if (privateMessageMatch) {
            const [, nickname, message] = privateMessageMatch;
            socket.emit('input', {
                data: `/msg ${nickname} ${message}`,
                timestamp: new Date().toISOString()
            });
        } else {
            socket.emit('input', {
                data: input,
                timestamp: new Date().toISOString()
            });
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

    // Fonction pour activer/désactiver les sons
    const toggleSounds = () => {
        setSoundsEnabled(!soundsEnabled);
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h2>{currentChannel ? `${currentChannel}` : 'general'}</h2>
                <button onClick={toggleSounds}>
                    {soundsEnabled ? 'Désactiver les sons' : 'Activer les sons'}
                </button>
            </div>
            <div className="messages" style={{overflowY: 'auto', height: '60vh'}}>
                {messages && messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type || 'received'}`}>
                        {msg.type === 'system-notification' ? (
                            <div className="system-notification">
                                {msg.text}
                            </div>
                        ) : msg.channels ? (
                            <div className="channel-list-message">
                                <strong>{msg.text}</strong>
                                <ul>
                                    {msg.channels.map((channel, idx) => (
                                        <li key={idx}>{channel}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : msg.type === 'system-notification' ? (
                            <div className="system-notification">
                                {msg.text}
                            </div>
                        ) : msg.type === 'private' ? (
                            <div className="private-message">
                                <span className="message-text">
                                    {msg.sender}: {msg.content}
                                </span>
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
            {/* Indicateur de saisie */}
            <div className="typing-indicator">
                {typingIndicatorText && <span>{typingIndicatorText}</span>}
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
            {soundsEnabled && (
                <>
                    <SoundPlayer soundFile="./Blip.mp3" play={playJoinSound} />
                    <SoundPlayer soundFile="./Bling.mp3" play={playMessageSound} />
                </>
            )}
        </div>
    );
};

export default ChatWindow;