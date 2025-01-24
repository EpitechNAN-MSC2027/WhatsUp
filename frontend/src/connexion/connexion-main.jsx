import React, { useState } from 'react';
import SignInForm from './signin';
import SignUpForm from './signup';
import Chat from '../chat/app.jsx';
import './login.css'
import backgroundVideo from '../assets/background-connexion.mp4';



const App = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [isChatVisible, setIsChatVisible] = useState(false);

    const switchToSignUp = () => setIsSignIn(false);
    const switchToSignIn = () => setIsSignIn(true);
    const navigateToChat = () => setIsChatVisible(true);

    return (
        <div className="login-container">
            {!isChatVisible && (
                <video autoPlay muted loop className="background-video">
                    <source src={backgroundVideo} type="video/mp4" />
                </video>
            )}
            {isChatVisible ? (
                <Chat />
            ) : isSignIn ? (
                <SignInForm switchToSignUp={switchToSignUp} navigateToChat={navigateToChat} />
            ) : (
                <SignUpForm switchToSignIn={switchToSignIn} />
            )}
        </div>
    );
};

export default App;
