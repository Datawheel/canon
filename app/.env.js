function defaultExport() {}

defaultExport.NODE_ENV = process.env.NODE_ENV || "development";
defaultExport.PORT = process.env.PORT || 3300;
defaultExport.ROOT = __dirname;

// defaultExport.GOOGLE_ANALYTICS = "UA-########-#";

module.exports = defaultExport;
