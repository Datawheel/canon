/**
  Simple test middleware function
*/
function exampleReduxMiddleware(canonMiddleware) {
  return canonMiddleware;
}

module.exports = {
  express: {
    bodyParser: {
      json: {
        verify: (req, red, buf) => {
          const url = req.originalUrl;
          console.log("verify", url);
          if (url.startsWith("/api/raw")) {
            req.rawBody = buf.toString();
          }
        }
      }
    }
  },
  reduxMiddleware(applyMiddleware, canonMiddleware) {
    const message = "reduxMiddleware from canon.js";
    console.log(message);
    return applyMiddleware(...exampleReduxMiddleware(canonMiddleware));
  }
};
