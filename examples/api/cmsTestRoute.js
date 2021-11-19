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

  app.get("/api/yeet", (req, res) => res.json({data: req.query}));

  // app.post("/api/cms/customAttributes/:pid", async(req, res) => {
  //   const pid = parseInt(req.params.pid, 10); // eslint-disable-line
  //   const {variables, locale} = req.body; // eslint-disable-line
  //   const {id1, dimension1, hierarchy1, slug1, name1, cubeName1, user} = variables; // eslint-disable-line
  //   /**
  //    * Make axios calls and return your compiled data as a single JS Object.
  //    */

  //   return res.json({
  //     iAmMassachusetts: name1 === "Massachusetts" ? true : false
  //   });

  //   /*
  //   if (pid === 49) {
  //     return res.json({
  //       capName: name1.toUpperCase()
  //     });
  //   }

  //   if (pid === 2) {
  //     // await new Promise(r => setTimeout(r, 5000));
  //     return res.json({});
  //   }
  //   else return res.json({});
  //   */
  // });

};
