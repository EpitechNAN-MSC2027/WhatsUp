// responseHandler.js

// Cette fonction gère les différentes actions de réponse
export const handleServerResponse = (response, setMessages, setChannelList, setUserList) => {
    if (response.status === 'error') {
        setMessages((prevMessages) => [
            ...prevMessages,
            { message: `Error on ${response.action}: ${response.message}`, type: 'error' },
        ]);
    }

    if (response.status === 'success') {
        switch (response.action) {
            case 'message':
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: response.message, type: 'message' },
                ]);
                break;

            case 'nick':
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: `${response.message}: ${response.data}`, type: 'nick' },
                ]);
                break;

            case 'list':
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: `${response.message}:`, type: 'list', channels: response.data },
                ]);
                setChannelList(response.data); // Mettez à jour la liste des canaux
                break;

            case 'create':
            case 'delete':
            case 'join':
            case 'quit':
            case 'msg':
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: response.message, type: response.action },
                ]);
                break;

            case 'users':
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: `${response.message}: ${response.data}`, type: 'users' },
                ]);
                setUserList(response.data); // Mettez à jour la liste des utilisateurs
                break;

            default:
                break;
        }
    }
};
