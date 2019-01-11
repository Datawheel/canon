const buble = require("buble");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/formatters", (req, res) => {

    db.formatter.findAll()
      .then(results => {
        results = results.map(r => {
          r = r.toJSON();
          if (r.logic) {
            let code = buble.transform(r.logic).code; 
            if (code.startsWith("!")) code = code.slice(1);
            r.logic = code;
          }
          return r;
        });
        res.json(results).end();
      });
  });
};
