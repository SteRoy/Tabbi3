const models = require("../../models");
let serverSocket;

module.exports = {
    listen: (io) => {
        serverSocket = io;
        const processUpdates = (roomName, roundId, updateList) => {
            models.Round.findOne({
                where: {
                    id: roundId
                },
                include: [
                    {
                        model: models.Debate,
                        include: [
                            models.AdjAlloc
                        ]
                    }
                ]
            }).then(round => {
                if (round) {
                    const adjAllocs = round.Debates.map(debate => debate.AdjAllocs).flat();
                    updateList.forEach(update => {
                        const adjAlloc = adjAllocs.find(a => a.AdjudicatorId === parseInt(update.AdjudicatorId));
                        adjAlloc.index = update.shiftTo;
                        adjAlloc.chair = update.shiftTo === 0;
                        if (update.type === "NEWROOM") {
                            adjAlloc.DebateId = parseInt(update.newRoom);
                        }
                        adjAlloc.save()
                    })
                }
            }).catch(err => {
                serverSocket.to(roomName).emit("error", err.toString());
            })
    }

        io.on("connection", (socket) => {
            const email = socket.request.user.email;

            socket.on("join_allocation", (tournamentSlug, roundId) => {
                // TODO: Validation
                if (email) {
                    socket.join(`${tournamentSlug}-${roundId}`)
                }
            });

            socket.on("adjudicator_update", (tournamentSlug, roundId, update) => {
                const socketRoomName = `${tournamentSlug}-${roundId}`;
                processUpdates(socketRoomName, parseInt(roundId), update);
                socket.to(socketRoomName).emit("new_adj_update", update);
            })

            socket.on("disconnect", () => {});
        });


    },

    toast: (title, subtitle) => {
        serverSocket.emit("toast", title, subtitle);
    }
}