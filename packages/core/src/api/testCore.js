module.exports = function(app) {

  const {
    CANON_API
  } = process.env;

  app.get("/api/alive/core", (req, res) => {

    const response = {
      error: false,
      msg: `Canon CORE is alive in ${CANON_API}/api/alive/core`
    };

    //TODO: add relevant validations here

    res.json(response);

  });

};
