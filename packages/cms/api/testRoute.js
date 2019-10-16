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

  app.get("/api/obesity", (req, res) => {
    return res.json({data: [
      {
        "County ID": "05000US36011",
        "County": "Cayuga County",
        "Year": 2014,
        "Obesity Rate": 0.25
      },
      {
        "County ID": "05000US36011",
        "County": "Cayuga County",
        "Year": 2015,
        "Obesity Rate": 0.28999999165534973
      },
      {
        "County ID": "05000US36011",
        "County": "Cayuga County",
        "Year": 2016,
        "Obesity Rate": 0.30000001192092896
      },
      {
        "County ID": "05000US36011",
        "County": "Cayuga County",
        "Year": 2017,
        "Obesity Rate": 0.3100000023841858
      },
      {
        "County ID": "05000US36011",
        "County": "Cayuga County",
        "Year": 2018,
        "Obesity Rate": 0.3100000023841858
      },
      {
        "County ID": "05000US36011",
        "County": "Cayuga County",
        "Year": 2019,
        "Obesity Rate": 0.33000001311302185
      },
      {
        "County ID": "05000US36023",
        "County": "Cortland County",
        "Year": 2014,
        "Obesity Rate": 0.27000001072883606
      },
      {
        "County ID": "05000US36023",
        "County": "Cortland County",
        "Year": 2015,
        "Obesity Rate": 0.27000001072883606
      },
      {
        "County ID": "05000US36023",
        "County": "Cortland County",
        "Year": 2016,
        "Obesity Rate": 0.2800000011920929
      },
      {
        "County ID": "05000US36023",
        "County": "Cortland County",
        "Year": 2017,
        "Obesity Rate": 0.27000001072883606
      },
      {
        "County ID": "05000US36023",
        "County": "Cortland County",
        "Year": 2018,
        "Obesity Rate": 0.2800000011920929
      },
      {
        "County ID": "05000US36023",
        "County": "Cortland County",
        "Year": 2019,
        "Obesity Rate": 0.3400000035762787
      },
      {
        "County ID": "05000US36053",
        "County": "Madison County",
        "Year": 2014,
        "Obesity Rate": 0.27000001072883606
      },
      {
        "County ID": "05000US36053",
        "County": "Madison County",
        "Year": 2015,
        "Obesity Rate": 0.2800000011920929
      },
      {
        "County ID": "05000US36053",
        "County": "Madison County",
        "Year": 2016,
        "Obesity Rate": 0.28999999165534973
      },
      {
        "County ID": "05000US36053",
        "County": "Madison County",
        "Year": 2017,
        "Obesity Rate": 0.25999999046325684
      },
      {
        "County ID": "05000US36053",
        "County": "Madison County",
        "Year": 2018,
        "Obesity Rate": 0.2800000011920929
      },
      {
        "County ID": "05000US36053",
        "County": "Madison County",
        "Year": 2019,
        "Obesity Rate": 0.28999999165534973
      },
      {
        "County ID": "05000US36067",
        "County": "Onondaga County",
        "Year": 2014,
        "Obesity Rate": 0.2800000011920929
      },
      {
        "County ID": "05000US36067",
        "County": "Onondaga County",
        "Year": 2015,
        "Obesity Rate": 0.27000001072883606
      },
      {
        "County ID": "05000US36067",
        "County": "Onondaga County",
        "Year": 2016,
        "Obesity Rate": 0.2800000011920929
      },
      {
        "County ID": "05000US36067",
        "County": "Onondaga County",
        "Year": 2017,
        "Obesity Rate": 0.2800000011920929
      },
      {
        "County ID": "05000US36067",
        "County": "Onondaga County",
        "Year": 2018,
        "Obesity Rate": 0.27000001072883606
      },
      {
        "County ID": "05000US36067",
        "County": "Onondaga County",
        "Year": 2019,
        "Obesity Rate": 0.30000001192092896
      },
      {
        "County ID": "05000US36075",
        "County": "Oswego County",
        "Year": 2014,
        "Obesity Rate": 0.3400000035762787
      },
      {
        "County ID": "05000US36075",
        "County": "Oswego County",
        "Year": 2015,
        "Obesity Rate": 0.33000001311302185
      },
      {
        "County ID": "05000US36075",
        "County": "Oswego County",
        "Year": 2016,
        "Obesity Rate": 0.28999999165534973
      },
      {
        "County ID": "05000US36075",
        "County": "Oswego County",
        "Year": 2017,
        "Obesity Rate": 0.28999999165534973
      },
      {
        "County ID": "05000US36075",
        "County": "Oswego County",
        "Year": 2018,
        "Obesity Rate": 0.30000001192092896
      },
      {
        "County ID": "05000US36075",
        "County": "Oswego County",
        "Year": 2019,
        "Obesity Rate": 0.33000001311302185
      }
    ]});
  });
};

