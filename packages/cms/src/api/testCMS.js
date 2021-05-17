module.exports = function(app) {

  const {
    CANON_API
  } = process.env;

  app.get("/api/alive/cms", (req, res) => {

    const response = {
      error: false,
      msg: `Canon CMS is alive in ${CANON_API}/api/alive/cms`
    };

    //TODO: add relevant validations here

    res.json(response);

  });

};
