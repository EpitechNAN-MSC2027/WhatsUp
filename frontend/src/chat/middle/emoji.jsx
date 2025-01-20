import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import './emoji.css';

const EmojiPickerComponent = ({ onEmojiSelect }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleEmojiClick = (emojiData) => {
        onEmojiSelect(emojiData.emoji); // Appelle la fonction parent pour ajouter l'émoji
        setShowPicker(false); // Ferme le picker après la sélection
    };

    return (
        <div className="emoji-picker-component">
            <div className="pick">
                <button className="pick" onClick={() => setShowPicker(!showPicker)}>😀</button>
            </div>
            {showPicker && (
                <div className="emoji-picker">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}
        </div>
    );
};

export default EmojiPickerComponent;
