import React, {useState} from "react";
import {io} from "socket.io-client";
import {uuid} from "d3plus-common";
import axios from "axios";
import {Button, Spinner} from "@blueprintjs/core";

const Socket = () => {

  const [progress, setProgress] = useState(false);

  const onLoad = () => {

    setProgress(false);

    // creates a new socket connection with itself (origin)
    const socket = io();

    // create and emit a unique sessionId
    const sessionId = uuid();
    socket.emit("init", sessionId);

    // on "progress" events, set returned data to progress state
    socket.on("progress", setProgress);

    // once the handshake "init" has been received, request data
    socket.on("init", () => {

      axios.post("/api/sockets", {sessionId})
        .then(() => {
          // when data has finished, clear progress and disconenct socket
          setProgress(false);
          socket.disconnect();
        });

    });

  };

  return (
    <div id="sockets">
      <Button
        icon={
          progress
            ? <Spinner
              size={16}
              value={
                progress.progress && progress.total
                  ? progress.progress / progress.total
                  : undefined
              } />
            : "download"
        }
        disabled={progress}
        onClick={onLoad}
      >
        Click to Test Socket Progress
      </Button>
    </div>
  );
};

export default Socket;
