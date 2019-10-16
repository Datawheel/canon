const d3Array = require("d3-array");
const axios = require("axios");
const yn = require("yn");

const verbose = yn(process.env.CANON_CMS_LOGGING);

// Older version of CANON_CMS_CUBES had a full path to the cube (path.com/cubes)
// CANON_CMS_CUBES was changed to be root only, so fix it here so we can handle
// both the new style and the old style
const url = process.env.CANON_CMS_CUBES
  .replace(/[\/]{0,}(cubes){0,}[\/]{0,}$/, "/cubes");

const s = (a, b) => {
  const ta = a.name.toUpperCase();
  const tb = b.name.toUpperCase();
  return ta < tb ? -1 : ta > tb ? 1 : 0;
};

const catcher = e => {
  if (verbose) {
    console.error("Error in cubeData.js: ", e);
  }
  return [];
};

module.exports = async function() {


  const resp = await axios.get(url).then(resp => resp.data).catch(catcher);
  // const resp = {"name":"cnyvitals","cubes":[{"name":"Unemployment Insurance","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Month","hierarchies":[{"name":"Month","levels":[{"name":"Month","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"Tract","levels":[{"name":"Tract","properties":null,"annotations":{"hide_in_ui":"false"}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Number of Beneficiaries","aggregator":{"name":"sum"},"annotations":{}},{"name":"Number of Claims","aggregator":{"name":"sum"},"annotations":{}}],"annotations":{"no_geo_cuts":"tract"}},{"name":"Public School Dropouts","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"County","levels":[{"name":"County","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}},{"name":"School Geography","hierarchies":[{"name":"School District","levels":[{"name":"School District","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Dropouts","aggregator":{"name":"sum"},"annotations":{}},{"name":"Enrollment","aggregator":{"name":"sum"},"annotations":{}}],"annotations":{}},{"name":"Public School Enrollment","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Grade","hierarchies":[{"name":"Grade","levels":[{"name":"Grade","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"County","levels":[{"name":"County","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}},{"name":"School Geography","hierarchies":[{"name":"School District","levels":[{"name":"School District","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Enrolled","aggregator":{"name":"sum"},"annotations":{}}],"annotations":{}},{"name":"Public School Graduation Rate","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"County","levels":[{"name":"County","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}},{"name":"School Geography","hierarchies":[{"name":"School District","levels":[{"name":"School District","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Enrolled","aggregator":{"name":"sum"},"annotations":{}},{"name":"Graduates","aggregator":{"name":"sum"},"annotations":{}}],"annotations":{}},{"name":"Test Scores","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"County","levels":[{"name":"County","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}},{"name":"School Geography","hierarchies":[{"name":"School District","levels":[{"name":"School District","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}},{"name":"Test","hierarchies":[{"name":"Test","levels":[{"name":"Test","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}}],"measures":[{"name":"Level 1 Test Scores","aggregator":{"name":"sum"},"annotations":{}},{"name":"Level 2 Test Scores","aggregator":{"name":"sum"},"annotations":{}},{"name":"Level 3 Test Scores","aggregator":{"name":"sum"},"annotations":{}},{"name":"Level 4 Test Scores","aggregator":{"name":"sum"},"annotations":{}}],"annotations":{}},{"name":"Obesity","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"County","levels":[{"name":"County","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Obesity Rate","aggregator":{"name":"avg"},"annotations":{}}],"annotations":{}},{"name":"arts_grants_5","dimensions":[{"name":"Start Year","hierarchies":[{"name":"Start Year","levels":[{"name":"Start Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"County","levels":[{"name":"County","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}},{"name":"Category","hierarchies":[{"name":"Category","levels":[{"name":"Category","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Program","hierarchies":[{"name":"Program","levels":[{"name":"Program","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Grantee","hierarchies":[{"name":"Grantee","levels":[{"name":"Grantee","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}}],"measures":[{"name":"Grant Amount","aggregator":{"name":"sum"},"annotations":{}}],"annotations":{}},{"name":"Asthma","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"State","levels":[{"name":"State","properties":null,"annotations":{}}],"annotations":{}},{"name":"County","levels":[{"name":"County","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Asthma Hospitalization Rate in Children","aggregator":{"name":"avg"},"annotations":{}}],"annotations":{}},{"name":"Syracuse City School District Scores","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Subject","hierarchies":[{"name":"Subject","levels":[{"name":"Subject","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Grade Level","hierarchies":[{"name":"Grade Level","levels":[{"name":"Grade Level","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"Tract","levels":[{"name":"Tract","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Number of Test Takers","aggregator":{"name":"sum"},"annotations":{}},{"name":"Number of Test Passers","aggregator":{"name":"sum"},"annotations":{}},{"name":"Pass Rate","aggregator":{"name":"avg"},"annotations":{}}],"annotations":{"no_geo_cuts":"tract","syracuse_tracts_only":"true"}},{"name":"Syracuse City School District All Tables","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"Tract","levels":[{"name":"Tract","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Place","levels":[{"name":"Place","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Kindergarten Readiness Rates All Students","aggregator":{"name":"avg"},"annotations":{}},{"name":"Kindergarten Readiness Rates Students in Poverty","aggregator":{"name":"avg"},"annotations":{}},{"name":"Chronic Absenteeism Rate All Students","aggregator":{"name":"avg"},"annotations":{}},{"name":"Chronic Absenteeism Rate Students in Poverty","aggregator":{"name":"avg"},"annotations":{}},{"name":"Ela Grade 3 Pass Rate All Students","aggregator":{"name":"avg"},"annotations":{}},{"name":"Ela Grade 3 Pass Rate Students in Poverty","aggregator":{"name":"avg"},"annotations":{}},{"name":"Percent Summer Learning Loss All Students","aggregator":{"name":"avg"},"annotations":{}},{"name":"Percent Summer Learning Loss Students in Poverty","aggregator":{"name":"avg"},"annotations":{}}],"annotations":{"syracuse_tracts_only":"true","no_geo_cuts":"place,tract"}},{"name":"Lead","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"Tract","levels":[{"name":"Tract","properties":null,"annotations":{}}],"annotations":{}},{"name":"Place","levels":[{"name":"Place","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Lead Value","aggregator":{"name":"avg"},"annotations":{}}],"annotations":{"no_geo_cuts":"place,tract"}},{"name":"Domestic Violence","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"County","levels":[{"name":"State","properties":null,"annotations":{}},{"name":"County","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}},{"name":"Victim","hierarchies":[{"name":"Victim","levels":[{"name":"Victim","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Assault","hierarchies":[{"name":"Assault","levels":[{"name":"Assault","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}}],"measures":[{"name":"Number of Victims","aggregator":{"name":"sum"},"annotations":{}}],"annotations":{}},{"name":"Mental Health","dimensions":[{"name":"Year","hierarchies":[{"name":"Year","levels":[{"name":"Year","properties":null,"annotations":{}}],"annotations":{}}],"annotations":{}},{"name":"Geography","hierarchies":[{"name":"County","levels":[{"name":"State","properties":null,"annotations":{}},{"name":"County","properties":[{"name":"Area","annotations":{}}],"annotations":{}}],"annotations":{}}],"annotations":{"dim_type":"Geography"}}],"measures":[{"name":"Poor Mental Health Days","aggregator":{"name":"avg"},"annotations":{}}],"annotations":{}}],"annotations":{}};
  const cubes = resp.cubes || [];

  const dimensions = [];

  cubes.forEach(cube => {

    cube.dimensions.forEach(d => {
      const dimension = {};
      dimension.name = `${d.name} (${cube.name})`;
      dimension.cubeName = cube.name;
      dimension.dimName = d.name;
      dimension.measures = cube.measures.map(m => m.name.replace(/'/g, "\'"));
      const hierarchies = d.hierarchies.map(h => {

        const levels = h.levels.filter(l => l.name !== "(All)").map(l => {
          const parts = l.fullName
            ? l.fullName
              .split(".")
              .map(p => p.replace(/^\[|\]$/g, ""))
            : [d.name, h.name, l.name];

          if (parts.length === 2) parts.unshift(parts[0]);
          return {
            dimension: parts[0],
            hierarchy: parts[1],
            level: parts[2],
            properties: l.properties
          };
        });
        return levels;
      });
      dimension.hierarchies = Array.from(new Set(d3Array.merge(hierarchies)));
      dimensions.push(dimension);
    });
  });

  return dimensions.sort(s);

};
