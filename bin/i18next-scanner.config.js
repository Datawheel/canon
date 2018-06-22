const fs = require("fs"),
      path = require("path"),
      shell = require("shelljs");

const locales = process.env.CANON_LANGUAGES || "en";
const {name} = JSON.parse(shell.cat("package.json"));

const localePath = path.join(__dirname, "../src/locale.js");

const defaultLocale = JSON.parse(shell.cat(localePath).replace(/^[^{]+/g, "").slice(0, -2));

module.exports = {
  options: {
    debug: false,
    defaultNs: name,
    func: {
      extensions: [".js", ".jsx"],
      list: ["i18next.t", "i18n.t", "t"]
    },
    interpolation: {
      prefix: "{{",
      suffix: "}}"
    },
    lngs: locales.split(","),
    ns: [name],
    removeUnusedKeys: false,
    resource: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
      savePath: "locales/{{lng}}/{{ns}}.json"
    },
    trans: {
      extensions: [".js", ".jsx"],
      fallbackKey: (ns, value) => value
    },
    sort: true
  },
  transform: function customTransform(file, enc, done) {

    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    function customParser(key) {
      const x = key.split(".");
      const defaultValue = defaultLocale[x[0]] ? x.reduce((o, i) => o[i], defaultLocale) : key;
      parser.set(key, {defaultValue});
      count++;
    }

    parser.parseFuncFromString(content, customParser);
    parser.parseTransFromString(content, customParser);
    parser.parseAttrFromString(content, customParser);

    if (count > 0) {
      shell.echo(`${`   ${count}`.slice(-3)} translations found in ${JSON.stringify(file.relative)}`);
    }

    done();
  }
};
