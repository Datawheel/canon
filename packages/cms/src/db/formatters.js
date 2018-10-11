module.exports = function(sequelize, db) {

  const f = sequelize.define("formatters",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.STRING, 
        defaultValue: "New Formatter"
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return n;"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  f.seed = [
    {
      logic: "if (typeof n === \"number\") n = formatters.abbreviate(n);\n      return n.charAt(0) === \"-\" ? n.replace(\"-\", \"-$\") : `$${n}`;",
      name: "Dollar",
      description: "Adds a US dollar sign to the beginning of a String or Number."
    },
    {
      logic: "if (typeof n === \"string\") n = libs.d3plus.date(n);\nreturn libs.d3.timeFormat(\"%B %d, %Y\")(n);",
      name: "Date",
      description: "Formats a date into \"%B %d, %Y\" format."
    },
    {
      logic: "return n.reduce((str, item, i) => {\n  if (!i) str += item;\n  else if (i === n.length - 1 && i === 1) str += ` and ${item}`;\n  else if (i === n.length - 1) str += `, and ${item}`;\n  else str += `, ${item}`;\n  return str;\n}, \"\");",
      name: "List",
      description: "Joins an array of strings together, adding commas and \"and\" when necessary."
    },
    {
      logic: "return n.replace(\/<[^>]+>\/g, \"\");",
      name: "StripHTML",
      description: "Removes all HTML tags from a string."
    },
    {
      logic: "if (typeof n !== \"number\") return \"N\/A\";\n\nconst length = n.toString().split(\".\")[0].length;\nlet val;\n\nif (n === 0) val = \"0\";\nelse if (length >= 3) {\n  const f = libs.d3.format(\".3s\")(n).replace(\"G\", \"B\");\n  const num = f.slice(0, -1);\n  const char = f.slice(f.length - 1);\n  val = `${parseFloat(num)}${char}`;\n}\nelse if (length === 3) val = libs.d3.format(\",f\")(n);\nelse val = libs.d3.format(\".3g\")(n);\n\nreturn val\n  .replace(\/(\\.[0-9]*[1-9])[0]*$\/g, \"$1\") \/* removes any trailing zeros *\/\n  .replace(\/[.][0]*$\/g, \"\"); \/* removes any trailing decimal point *\/",
      name: "Abbreviate",
      description: "Abbreviates a number into a smaller more human-readible number."
    },
    {
      logic: "let str;\nif (n < 1000000) {\n  str = libs.d3.format(\",\")(n.toFixed(0));\n}\nelse str = formatters.abbreviate(n);\nreturn formatters.dollar(str);",
      name: "Salary",
      description: "Displays salary values with proper precision (ie. \"$74,200\" instead of \"$74.2k\")"
    },
    {
      logic: "const {curr, currMoe = 0, prev, prevMoe = 0} = n;\n      let value;\n      if (currMoe || prevMoe) {\n        const f1 = Math.pow(-prev \/ Math.pow(curr, 2), 2) * Math.pow(currMoe, 2);\n        const f2 = Math.pow(1 \/ curr, 2) * Math.pow(prevMoe, 2);\n        value = Math.sqrt(f1 + f2);\n      }\n      else value = (curr - prev) \/ prev;\n      return value * 100;",
      name: "Growth",
      description: "Calculates the growth percentage between two numbers provided the following object format: {curr, prev}. Also supports calculating the growth between two margin of errors using this format: {curr, currMoe, prev, prevMoe}."
    },
    {
      logic: "return n < 0 ? \"decline\" : \"growth\";",
      name: "GrowthWord",
      description: "Returns either \"growth\" or \"decline\" depending on the provided number's sign."
    },
    {
      logic: "return n < 0 ? \"declined\" : n > 0 ? \"grew\" : \"stayed\";",
      name: "GrewWord",
      description: "Returns either \"grew\", \"declined\", or \"stayed\" depending on the provided number's sign."
    },
    {
      logic: "return n < 0 ? \"decrease\" : n > 0 ? \"increase\" : \"change\";",
      name: "IncreaseWord",
      description: "Returns either \"increase\", \"decrease\", or \"change\" depending on the provided number's sign."
    },
    {
      logic: "return n < 0 ? \"less than\" : n > 0 ? \"more than\" : \"approximately the same\";",
      name: "MoreWord",
      description: "Returns either \"more than\", \"less than\", or \"approximately the same\" depending on the provided number's sign."
    },
    {
      logic: "return libs.d3.format(\",\")(Math.round(n));",
      name: "Commas",
      description: "Rounds to nearest whole number and adds commas."
    },
    {
      logic: "const {data, bucket, value, weight} = n;\nconst sum = libs.d3.sum;\nconst newData = [];\nconst weightTotal = sum(data, d => d[weight]);\ndata.forEach(function(d, i) {\n  const bucketName = `${d[bucket]}`\n    .replace(\/^[\\s\\<\\>\\$A-z]*\/g, \"\")\n    .replace(\/[A-z0-9]+\\-\/g, \"\");\n  const mod = d[bucket].includes(\">\") || d[bucket].includes(\"+\")\n    || d[bucket].includes(\"more\") || d[bucket].includes(\"over\") || d[bucket].includes(\"greater\")\n    ? 1 : 0;\n  newData.push({\n    data: d,\n    bucket: parseFloat(bucketName, 10) + mod,\n    total: d[value] * d[weight]\n  });\n});\nnewData.sort((a, b) => a.bucket - b.bucket);\nconst total = sum(newData, d => d.total);\nnewData.forEach(function(d, i) {\n  d.pctTotal = d.total \/ total;\n  d.pctWeight = d.data[weight] \/ weightTotal;\n});\nnewData.forEach(function(d, i) {\n  d.pctBetter = i === newData.length - 1 ? 0 : sum(newData.slice(i + 1), n => n.pctWeight);\n  d.score = d.pctTotal * (d.pctWeight + (2 * d.pctBetter));\n});\nreturn 1 - sum(newData, d => d.score);",
      name: "GINI",
      description: "Calculates GINI growth given an array of data and string keys to access the following: bucket, value, weight."
    },
    {
      logic: "return `${formatters.abbreviate(Math.abs(n))}%`;",
      name: "GrowthPct",
      description: "Abbreviates a growth value, turns it absolute, and adds a percent sign."
    },
    {
      logic: "return n < 0 ? \"less\" : \"more\";",
      name: "MoreLess",
      description: "Returns either \"more\" or \"less\" depending on the provided number's sign."
    },
    {
      logic: "const re = new RegExp(\/([\\$0-9\\,]+)[A-z\\-\\s\\&]*([\\$0-9\\,]*)\/g);\nlet nums = re.exec(n)\nif (nums) {\n  nums = nums.slice(1)\n    .filter(d => d.length)\n    .map(d => {\n      if (d.includes(\",\")) {\n        if (d.indexOf(\",\") === d.length - 4) {\n          d = d.replace(\/,000$\/g, \"k\")\n            .replace(\/([0-9]+)(,999$)\/g, n => `${parseInt(n) + 1}k`);\n        }\n        else if (d.indexOf(\",\") === d.length - 8) {\n          d = d.replace(\/,000,000$\/g, \"M\")\n            .replace(\/([0-9]+)(,999,999$)\/g, n => `${parseInt(n) + 1}M`);\n        }\n      } \n      return d;\n    });\n  if (nums.length === 2) return nums.join(\" - \");\n  else if (n.toLowerCase().match(\/under|less|\\<\/g)) return `< ${nums[0]}`;\n  else if (n.toLowerCase().match(\/over|more|\\+|\\>\/g)) return `${nums[0]}+`;\n  else return `${nums[0]}`;\n}\nelse return \"None\";",
      name: "Bucket",
      description: "Sanitizes bucket strings to \"< n\", \"n1 - n2\", and \"n+\""
    },
    {
      logic: "return n.replace(\/\\w$\/g, chr => chr === \"y\" ? \"ies\" : `${chr}s`)",
      name: "Plural",
      description: "Pluralizes a word."
    },
    {
      logic: "return n < 0 ? \"lower than\" : n > 0 ? \"higher than\" : \"approximately the same as\";",
      name: "HighWord",
      description: "Returns either \"higher than\", \"lower than\", or \"approximately the same as\" depending on the provided number's sign."
    },
    {
      logic: "return n < 0 ? \"getting younger\" : n > 0 ? \"getting older\" : \"staying the same age\";",
      name: "OlderWord",
      description: null
    },
    {
      logic: "return n < 0 ? \"younger than\" : n > 0 ? \"older than\" : \"the same age as\";",
      name: "OlderYounger",
      description: null
    },
    {
      logic: "return n < 0 ? \"decreasing\" : n > 0 ? \"increasing\" : \"maintaining\";",
      name: "Increasing",
      description: null
    },
    {
      logic: "return n < 0 ? \"declined from\" : n > 0 ? \"grew to\" : \"stayed at\";",
      name: "GrewTo",
      description: null
    },
    {
      logic: "return n < 0 ? \"shorter\" : n > 0 ? \"longer\" : \"similar\";",
      name: "LongWord",
      description: null
    },
    {
      logic: "return n < 0 ? \"smaller than\" : n > 0 ? \"larger than\" : \"the same as\";",
      name: "LargerThan",
      description: null
    },
    {
      logic: "return n < 0 ? \"declining\" : \"growing\";",
      name: "Growing",
      description: null
    },
    {
      logic: "return n < 0 ? \"decreased\" : n > 0 ? \"increased\" : \"remained the same\";",
      name: "IncreasedWord",
      description: null
    },
    {
      logic: "return n < 0 ? \"fewer\" : \"more\";",
      name: "MoreFewerWord",
      description: null
    },
    {
      logic: "return Math.abs(n);",
      name: "Abs",
      description: "Simple Absolute Value"
    }

  ];

  return f;

};
