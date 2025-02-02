import React, { useEffect, useRef } from 'react';

const SoundPlayer = ({ soundFile, play }) => {
    const audioRef = useRef(null);

    useEffect(() => {
        if (play && audioRef.current) {
            audioRef.current.play();
        }
    }, [play]);

    return (
        <audio ref={audioRef} src={soundFile} preload="auto" />
    );
};

export default SoundPlayer;