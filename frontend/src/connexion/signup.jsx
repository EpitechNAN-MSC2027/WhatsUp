import React, { useState } from 'react';
import AvatarCustomization from '../../avatar';

const SignUpForm = ({ switchToSignIn }) => {
    const [showAvatar, setShowAvatar] = useState(false);
    const [registeredUsername, setRegisteredUsername] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            console.log(response.body)

            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('username', username);
                setRegisteredUsername(username);
                setShowAvatar(true);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Erreur lors de la création du compte.');
        }
    };

    const handleAvatarComplete = () => {
        alert('Compte créé avec succès!');
        switchToSignIn();
    };

    if (showAvatar) {
        return <AvatarCustomization onComplete={handleAvatarComplete} />;
    }

    return (
        <form className="form_login" onSubmit={handleSubmit}>
            <h1>SIGN UP</h1>
            <label>Username</label>
            <input type="text" name="username" required />

            <label>Password</label>
            <input type="password" name="password" required />

            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" required />

            <input type="submit" className="button" value="Sign Up" />

            <p className="link">
                Already have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); switchToSignIn(); }}>
                    Sign In!
                </a>
            </p>
        </form>
    );
};

export default SignUpForm;
