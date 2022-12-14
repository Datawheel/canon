module.exports = function(app) {

  app.post("/api/sockets", async(req, res) => {

    // retrieve client sessionId from POST body
    const {sessionId} = req.body;

    // find socket corresponding to client sessionId
    const sockets = app.get("sockets");
    const io = app.get("io");
    const socket = io.to(sockets[sessionId]);

    // emit initial "zero-state" progress
    const total = 100;
    socket.emit("progress", {progress: 0, total});

    // create a dummy "progress" emit every 1 second until finished
    for (let i = 0; i <= total; i += 10) {
      setTimeout(() => {
        socket.emit("progress", {progress: i, total});
        if (i === total) res.json(true).end();
      }, i * 100);
    }

  });

};
