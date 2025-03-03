import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from './signin.jsx';
import SignUpForm from './signup.jsx';
import './login.css';
import backgroundVideo from '../assets/background-connexion.mp4';

const ConnexionMain = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const navigate = useNavigate();

    const switchToSignUp = () => setIsSignIn(false);
    const switchToSignIn = () => setIsSignIn(true);
    
    const navigateToChat = () => {
        navigate('/chat');
    };

    return (
        <div className="login-container">
            <video autoPlay muted loop className="background-video">
                <source src={backgroundVideo} type="video/mp4" />
            </video>
            <div className="form-container">
                {isSignIn ? (
                    <SignInForm 
                        switchToSignUp={switchToSignUp} 
                        navigateToChat={navigateToChat}
                    />
                ) : (
                    <SignUpForm switchToSignIn={switchToSignIn} />
                )}
            </div>
        </div>
    );
};

export default ConnexionMain;
