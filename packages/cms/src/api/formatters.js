const buble = require("buble");

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/formatters", (req, res) => {

    db.formatter.findAll()
      .then(results => {
        results = results.map(r => {
          r = r.toJSON();
          if (r.logic) {
            // Formatters may be malformed. Wrap in a try/catch to avoid js crashes.
            try {
              let code = buble.transform(r.logic).code; 
              if (code.startsWith("!")) code = code.slice(1);
              r.logic = code;
            }
            catch (e) {
              console.error(`Error in Formatter ${r.name}`);
              console.error(`Error message: ${e.message}`);
              r.logic = "return \"N/A\";";
            }
          }
          return r;
        });
        res.json(results).end();
      });
  });
};
