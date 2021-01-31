let serverSocket;

module.exports = {
    listen: (io) => {
        serverSocket = io;
        io.on("connection", (socket) => {
            const email = socket.request.user.email;
            socket.on("disconnect", () => {
                console.log("Client disconnected");
            });
        });
    },

    toast: (title, subtitle) => {
        serverSocket.emit("toast", title, subtitle);
    }
}