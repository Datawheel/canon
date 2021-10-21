const fs = require("fs"),
      path = require("path"),
      shell = require("shelljs");

const sectionTypeDir = path.join(__dirname, "../../components/sections/");
const sectionTypeDirCustom = path.join(process.cwd(), "app/cms/sections/");

module.exports = () => {
  const sectionTypes = [];
  shell.ls(`${sectionTypeDir}*.jsx`).forEach(file => {
    // In Windows, the shell.ls command returns forward-slash separated directories,
    // but the node "path" command returns backslash separated directories. Flip the slashes
    // so the ensuing replace operation works (this should be a no-op for *nix/osx systems)
    const sectionTypeDirFixed = sectionTypeDir.replace(/\\/g, "/");
    const compName = file.replace(sectionTypeDirFixed, "").replace(".jsx", "");
    if (compName !== "Section") sectionTypes.push(compName);
  });
  if (fs.existsSync(sectionTypeDirCustom)) {
    shell.ls(`${sectionTypeDirCustom}*.jsx`).forEach(file => {
      const sectionTypeDirCustomFixed = sectionTypeDirCustom.replace(/\\/g, "/");
      const compName = file.replace(sectionTypeDirCustomFixed, "").replace(".jsx", "");
      sectionTypes.push(compName);
    });
  }
  return sectionTypes;
};
