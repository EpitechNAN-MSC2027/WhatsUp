import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './avatar.css';

const AvatarCustomization = ({ onComplete }) => {
    const avatarParts = {
        body: [
            '../../public/avatars/body1.png',
            '../../public/avatars/body2.png',
            '../../public/avatars/body3.png',
            '../../public/avatars/body4.png',
            '../../public/avatars/body5.png'
        ],
        eyes: [
            '/avatars/eyes1.png',
            '/avatars/eyes2.png',
            '/avatars/eyes3.png',
            '/avatars/eyes4.png',
            '/avatars/eyes5.png'
        ],
        mouth: [
            '/avatars/mouth1.png',
            '/avatars/mouth2.png',
            '/avatars/mouth3.png',
            '/avatars/mouth4.png',
            '/avatars/mouth5.png'
        ],
        hair: [
            '/avatars/hair1.png',
            '/avatars/hair2.png',
            '/avatars/hair3.png',
            '/avatars/hair4.png',
            '/avatars/hair5.png'
        ],
        clothes: [
            '/avatars/outfit1.png',
            '/avatars/outfit2.png',
            '/avatars/outfit3.png',
            '/avatars/outfit4.png',
            '/avatars/outfit5.png'
        ]
    };

    const [socket, setSocket] = useState(null);
    const [avatar, setAvatar] = useState(
        Object.keys(avatarParts).reduce((acc, part) => {
            acc[part] = {
                currentIndex: 0,
                images: avatarParts[part]
            };
            return acc;
        }, {})
    );

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            auth: {
                token: localStorage.getItem('token'),
            }
        });
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);

    const handlePartChange = (part, direction) => {
        setAvatar(prev => {
            const currentPart = prev[part];
            let newIndex = currentPart.currentIndex + direction;

            if (newIndex < 0) newIndex = currentPart.images.length - 1;
            if (newIndex >= currentPart.images.length) newIndex = 0;

            return {
                ...prev,
                [part]: {
                    ...currentPart,
                    currentIndex: newIndex
                }
            };
        });
    };

    const handleSave = () => {
        if (!socket) return;

        const avatarState = Object.keys(avatar).reduce((acc, part) => {
            acc[part] = avatar[part].currentIndex + 1;
            return acc;
        }, {});

        socket.emit('save-avatar', avatarState);
        socket.once('avatar-saved', (response) => {
            if (response.success) {
                localStorage.setItem('avatarParts', JSON.stringify(avatarState));
                onComplete();
            } else {
                alert('Erreur lors de la sauvegarde de l\'avatar');
            }
        });
    };

    return (
        <div className="avatar-container">
            <h2>Personnalisez votre avatar</h2>
            <div className="avatar-image-container">
                {Object.keys(avatarParts).map(part => (
                    <img 
                        key={part}
                        className="avatar-image"
                        src={avatar[part].images[avatar[part].currentIndex]}
                        alt={part}
                    />
                ))}
            </div>
            <div className="avatar-navigation">
                {Object.keys(avatarParts).map(part => (
                    <div key={part} className="part-navigation">
                        <button onClick={() => handlePartChange(part, -1)}>←</button>
                        <span>{part}</span>
                        <button onClick={() => handlePartChange(part, 1)}>→</button>
                    </div>
                ))}
                <button onClick={handleSave} className="save-button">
                    Sauvegarder et continuer
                </button>
            </div>
        </div>
    );
};

export default AvatarCustomization;