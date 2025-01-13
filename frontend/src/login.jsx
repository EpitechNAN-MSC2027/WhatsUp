import React, { useState } from "react";
import './style.css';

const SignInForm = ({ switchToSignUp, navigateToChat }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const response = await fetch('http://localhost:3000/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (result.success) {
                // Navigue vers le chat en cas de succès
                navigateToChat();
            } else {
                alert(result.message || 'Login failed!');
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            alert('Erreur lors de la connexion.');
        }
    };

    return (
        <form className="form_login" onSubmit={handleSubmit}>
            <h1>SIGN IN</h1>
            <label>Username</label>
            <input type="email" name="username" required />

            <label>Password</label>
            <input type="password" name="password" required />

            <input type="submit" className="button" value="Sign In" />
            <p className="link">
                Don't have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); switchToSignUp(); }}>
                    Create one!
                </a>
            </p>
        </form>
    );
};

const SignUpForm = ({ switchToSignIn }) => {
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
            const response = await fetch('http://localhost:8000/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();
            if (result.success) {
                alert('Account created successfully!');
                switchToSignIn();
            } else {
                alert(result.message || 'Sign Up failed!');
            }
        } catch (error) {
            console.error('Erreur lors de la création du compte:', error);
            alert('Erreur lors de la création du compte.');
        }
    };

    return (
        <form className="form_login" onSubmit={handleSubmit}>
            <h1>SIGN UP</h1>
            <label>Username</label>
            <input type="email" name="username" required />

            <label>Password</label>
            <input type="password" name="password" required />

            <label>Confirm your password</label>
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

