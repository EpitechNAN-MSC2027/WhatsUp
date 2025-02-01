import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import commands from './commands.jsx';
import EmojiPickerComponent from './emoji.jsx';
import { handleCommand } from './responseHandler.jsx';
import SoundPlayer from './SoundPlayer'; 
import soundOnImage from '../../assets/sound-on.png';
import soundOffImage from '../../assets/sound-off.png';


const ChatWindow = ({ currentChannel, socket }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [commandSuggestions, setCommandSuggestions] = useState([]);
    const [channels, setChannels] = useState([]);
    const [playJoinSound, setPlayJoinSound] = useState(false);
    const [playMessageSound, setPlayMessageSound] = useState(false);
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [isTyping, setIsTyping] = useState(false); 
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const shouldScrollInstant = useRef(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        let typingTimeout;

        if (input.trim()) {
            setIsTyping(true);
            socket.emit('typing', { user: localStorage.getItem('username'), channel: currentChannel });

            typingTimeout = setTimeout(() => {
                setIsTyping(false);
                socket.emit('stoppedTyping', { user: localStorage.getItem('username'), channel: currentChannel });
            }, 1000); 
        } else {
            setIsTyping(false);
            socket.emit('stoppedTyping', { user: localStorage.getItem('username'), channel: currentChannel });
        }

        return () => clearTimeout(typingTimeout);
    }, [input, socket, currentChannel]);

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
                sender: msg.sender,
                message: msg.message,
                type: 'received'
            }));
            shouldScrollInstant.current = true;
            setMessages(formattedHistory);
        });

        socket.on('message', (messageData) => {
            console.log('Message reçu:', messageData);
            setMessages(prevMessages => [...prevMessages, {
                text: messageData,
                sender: messageData.sender,
                message: messageData.message,
                type: 'received'
            }]);
            if (soundsEnabled) {
                setPlayMessageSound(true); 
            }
        });

        socket.on('userJoined', (nickname) => {
            console.log(`${nickname} joined`); 
            setMessages(prevMessages => [...prevMessages, {
                text: `${nickname} joined the channel :)`,
                type: 'system-notification',
                timestamp: new Date().toISOString()
            }]);
            if (soundsEnabled) {
                console.log("Sound for joining"); 
                setPlayJoinSound(true); 
            }
        });

        socket.on('userLeft', (username) => {
            setMessages(prevMessages => [...prevMessages, {
                text: `${username} left the channel :(`,
                type: 'system-notification'
            }]);
            if (soundsEnabled) {
                console.log("Sound for leaving"); 
                setPlayJoinSound(true);
            }
        });

        socket.on('response', (response) => {
            console.log('Response from server:', response);

            if (response.action === 'list' && response.status === 'success') {
                setChannels(response.data);
                setMessages(prev => [...prev, {
                    text: 'Channels :',
                    type: 'system',
                    channels: response.data
                }]);
            } else if (response.action === 'users' && response.status === 'success') {
                setUsers(response.data);
                setMessages(prev => [...prev, {
                    text: 'Users in the channel :',
                    type: 'system',
                    users: response.data
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

    useEffect(() => {
        if (playJoinSound) {
            setPlayJoinSound(false);
        }
    }, [playJoinSound]);

    useEffect(() => {
        if (playMessageSound) {
            setPlayMessageSound(false);
        }
    }, [playMessageSound]);

    useEffect(() => {
        if (messagesEndRef.current) {
            if (shouldScrollInstant.current) {
                // Instant scroll for channel changes
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
                shouldScrollInstant.current = false;
            } else {
                // Smooth scroll for new messages
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
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

        if (userInput.startsWith('/')) {
            const commandPrefix = userInput.slice(1).toLowerCase();
            const suggestions = Object.keys(commands)
                .filter((command) => command.startsWith(commandPrefix))
                .map((command) => command);
            setCommandSuggestions(suggestions);
        } else {
            setCommandSuggestions([]); 
        }
    };

    const handleSuggestionClick = (command) => {
        setInput(`/${command}`);
        setCommandSuggestions([]); 
    };

    const handleEmojiSelect = (emoji) => {
        setInput((prevInput) => prevInput + emoji); 
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            handleSendMessage(); 
        }
    };

    const toggleSounds = () => {
        setSoundsEnabled(!soundsEnabled);
    };

    return (
        <div className="chat-window">
            <div className="chat-header" style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ marginRight: '10px' }}>{currentChannel ? `${currentChannel}` : 'general'}</h2>
                <img 
                    src={soundsEnabled ? soundOnImage : soundOffImage} 
                    alt="Toggle Sounds" 
                    onClick={toggleSounds} 
                    style={{ cursor: 'pointer', width: '20px', height: '20px', marginLeft: '10px', marginTop: '-7px' }} 
                />
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
                        ) : msg.users ? (
                            <div className="channel-list-message">
                                <strong>{msg.text}</strong>
                                <ul>
                                    {msg.users.map((user, idx) => (
                                        <li key={idx}>{user}</li>
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
            <div className="message-input">
                <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />

                <div className="input-container">
                    <div className={`typing-indicator ${typingIndicatorText ? 'active' : ''}`}>
                        {typingIndicatorText && <span>{typingIndicatorText}</span>}
                    </div>
                    <input
                        type="text"
                        placeholder={currentChannel
                            ? "Type a message, e.g., /list or Hello!"
                            : "Use /list to view available channels or /join <channel> to join a channel"}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                </div>
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