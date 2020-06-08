module.exports = function(app) {

  app.get("/api/test", (req, res) => {
    res.json({data: [
      {id: "alpha", x: 4, y: 7},
      {id: "alpha", x: 5, y: 25},
      {id: "alpha", x: 6, y: 13},
      {id: "beta",  x: 4, y: 17},
      {id: "beta",  x: 5, y: 8},
      {id: "beta",  x: 6, y: 13}
    ]}).end();
  });
  
  app.get("/api/test2", (req, res) => {
    res.json({data: [
      {uid: "3123", name: "jimmy", x: 13},
      {uid: "3434", name: "dave", x: 23},
      {uid: "8934", name: "alex", x: 3},
      {uid: "6421", name: "cesar", x: 28}
    ]}).end();
  });

  app.post("/api/cms/customAttributes/:pid", (req, res) => {
    const pid = parseInt(req.params.pid, 10); // eslint-disable-line
    const {variables, locale} = req.body; // eslint-disable-line
    const {id1, dimension1, hierarchy1, slug1, name1, cubeName1, user} = variables; // eslint-disable-line
    /**
     * Make axios calls and return your compiled data as a single JS Object.
     */
    if (pid === 49) {
      return res.json({
        capName: name1.toUpperCase()
      });
    }
    else return res.json({});
  });

};
