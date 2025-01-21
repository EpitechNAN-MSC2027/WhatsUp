import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import './emoji.css';

const EmojiPickerComponent = ({ onEmojiSelect }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleEmojiClick = (emojiData) => {
        onEmojiSelect(emojiData.emoji);
        setShowPicker(false);
    };

    return (
        <div className="emoji-picker-component">
                <button className="pick" onClick={() => setShowPicker(!showPicker)}>😀</button>
            {showPicker && (
                <div className="emoji-picker">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}
        </div>
    );
};

export default EmojiPickerComponent;
