const FUNC = require ("./FUNC");

const formatters4eval = async(db, locale) => {

  const formatters = await db.formatter.findAll().catch(() => []);

  return formatters.reduce((acc, f) => {

    const name = f.name === f.name.toUpperCase()
      ? f.name.toLowerCase()
      : f.name.replace(/^\w/g, chr => chr.toLowerCase());

    // Formatters may be malformed. Wrap in a try/catch to avoid js crashes.
    try {
      acc[name] = FUNC.parse({logic: f.logic, vars: ["n"]}, acc, locale);
    }
    catch (e) {
      console.error(`Server-side Malformed Formatter encountered: ${name}`);
      console.error(`Error message: ${e.message}`);
      acc[name] = FUNC.parse({logic: "return \"N/A\";", vars: ["n"]}, acc, locale);
    }

    return acc;

  }, {});
};

module.exports = formatters4eval;
