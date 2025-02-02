export const handleCommand = (response) => {
    let output = "";
    let data = null;

    if (response.status === "error") {
        output = `Error on ${response.action}: ${response.message}`;
    } else if (response.status === "success") {
        switch (response.action) {
            case "message":
                output = response.message;
                break;

            case "nick":
                output = `${response.message}: ${response.data}`;
                break;

            case "list":
                output = `${response.message}:\n`;
                data = response.action; // Liste des canaux
                break;

            case "create":
            case "delete":
            case "join":
            case "quit":
            case "users":
            case "msg":
                output = `${response.message}`;
                break;

            default:
                output = "Unknown command";
                break;
        }
    }

    return { output, data };
};
