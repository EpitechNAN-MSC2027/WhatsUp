import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const App = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);  // Messages reçus du serveur
    const [input, setInput] = useState("");  // Message à envoyer

    useEffect(() => {
        // Connect to the server
        const newSocket = io('http://localhost:3000');

        // Set the socket instance
        setSocket(newSocket);

        // Log connection status
        newSocket.on('connect', () => {
            console.log('Connected to server:', newSocket.id);
        });

        // Listen for server responses
        newSocket.on('response', (data) => {
            console.log('Response from server:', data);

            // Add the server's response to the messages
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Handle sending the command input
    const handleSendMessage = () => {
        if (input.trim() && socket) {
            // Emit the message to the server
            socket.emit('input', input);

            // Reset the input field
            setInput('');
        }
    };

    return (
        <div>
            <h3>Chat</h3>
            <div>
                {/* Display received messages */}
                {messages.map((msg, index) => (
                    <div key={index}>
                        <pre>{JSON.stringify(msg, null, 2)}</pre>
                    </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    id="inputField"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button id="sendButton" onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default App;
