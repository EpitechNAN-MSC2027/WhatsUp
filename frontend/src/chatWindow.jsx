import React, { useState, useEffect } from "react";

const ChatWindow = ({ selectedTeam, socket }) => {
    const [messages, setMessages] = useState([]); // Messages reçus
    const [input, setInput] = useState(""); // Message à envoyer

    // Écoute des réponses du serveur
    useEffect(() => {
        if (socket) {
            socket.on("response", (data) => {
                setMessages((prevMessages) => [...prevMessages, data]);
            });
        }

        // Cleanup à la suppression du composant
        return () => {
            if (socket) {
                socket.off("response"); // Désabonnez-vous de l'événement
            }
        };
    }, [socket]);

    // Gestion de l'envoi de message
    const handleSendMessage = () => {
        if (input.trim() && socket) {
            socket.emit("input", input); // Envoi du message au serveur
            setInput(""); // Réinitialise le champ d'entrée
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
