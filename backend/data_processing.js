// Database placeholders
let db_users = ['guy', 'superman'];
let db_channels = ['general', 'random'];

export async function updateNickname(nickname) {
    if (!db_users.includes(nickname)) {
        db_users.push(nickname);
        return nickname;
    } else {
        throw new Error('Nickname already exists');
    }

    /*
    const { userId, newValues } = data;

    // Basic validation
    if (!userId || !newValues) {
        throw new Error('Invalid input: userId and newValues are required.');
    }

    if (data.contains(" ")) {
        throw new Error('Invalid input: Nickname cannot contain spaces.');
    }

    try {
        // Simulate a database operation (replace with actual DB logic)
        const user = await UserModel.findById(userId); // Assume UserModel is your database model

        if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        // Update user details
        Object.assign(user, newValues); // Merge newValues into the user object
         // Save the updated user to the database
        return await user.save(); // Return the updated user object
    } catch (err) {
        // Log the error for debugging purposes (optional)
        console.error(`Error updating user in database: ${err.message}`);

        // Re-throw the error to be caught by the caller
        throw new Error(`Database error: ${err.message}`);
    }
     */
}

export async function create() {

}

export async function listUsers() {
    return db_users;
}