import React from 'react';

const SignInForm = ({ switchToSignUp, navigateToChat }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('username', username);
                
                // Récupérer l'avatar après la connexion
                const avatarResponse = await fetch(`http://localhost:3000/get-avatar/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${result.token}`
                    }
                });
                const avatarData = await avatarResponse.json();
                
                if (avatarData.success) {
                    localStorage.setItem('avatarParts', JSON.stringify(avatarData.avatarParts));
                }
                
                navigateToChat();
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Erreur lors de la connexion.');
        }
    };

    return (
        <form className="form_login" onSubmit={handleSubmit}>
            <h1>SIGN IN</h1>
            <label>Username</label>
            <input type="text" name="username" required />

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

export default SignInForm;
