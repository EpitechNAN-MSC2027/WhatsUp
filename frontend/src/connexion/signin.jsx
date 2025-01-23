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
            console.log(result);

            //document.cookie = 'token=' + result.token;
            localStorage.setItem('token', result.token);

            if (result.success) {
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
