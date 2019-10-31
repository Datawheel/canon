module.exports = function(app) {

  app.get("/api/test", (req, res) => {
    res.json({data: [
      {id: "alpha", x: 4, y: 7},
      {id: "alpha", x: 5, y: 25},
      {id: "alpha", x: 6, y: 13},
      {id: "beta",  x: 4, y: 17},
      {id: "beta",  x: 5, y: 8},
      {id: "beta",  x: 6, y: 13},
      // {id: "omega", x: "40000", y: 170000},
      // {id: "omega", x: "50000", y: 80000},
      // {id: "omega", x: "60000", y: 130000}
    ]}).end();
  });
  // .get("/api/test2", (req, res) => {
  //   res.json({data: [
  //     {id: "james", x: 2, z: 7},
  //     {id: "james", x: 3, z: 2},
  //     {id: "james", x: 8, z: 3}
  //   ]}).end();
  // });
};
