/**
 * Sign up the user
 * Send a post request to the server
 * Use the name, email and password from the form data
 * if the server returns an error alert the user
 * if the server returns a user object set the app state with the user object
 * @param event
 */
export async function handleSignUp(event){
    event.preventDefault();

    const formData = new FormData(event.target);
    const body = {
        name: formData.get("name").toString(),
        firstname: formData.get("firstname").toString(),
        email: formData.get("email").toString(),
        password: formData.get("password").toString()
};

    try {
        const res = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            switch (res.status) {
                case 409:
                    alert('This email is already used');
                    break;
                default:
                    alert('An unexpected error occurred');
                    break;
            }
            return;
        } else {
            window.location.href = '/';
        }

        const data = await res.json(); // parse response into a user object
        console.log(data);
        return data;

    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Sign in the user
 * Send a post request to the server
 * Use the email and password from the form data
 * if the server returns an error alert the user
 * if the server returns a user object set the app state with the user object
 *
 * @param event
 */
export async function handleSignIn(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const body = {
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || ""
    };

    try {
        const res = await fetch('http://localhost:3000/people/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            switch (res.status) {
                case 401:
                    alert('Invalid email or password');
                    break;
                default:
                    alert('An unexpected error occurred');
            }
        } else {
            const data = await res.json();
            const token = data.token;

            document.cookie = `token=${token}; path=/; max-age=3600; secure; samesite=strict;`;
            window.location.href = '/';
        }
    } catch (error) {
        console.log(error);
    }
}