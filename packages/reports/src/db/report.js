const {REPORT_TYPES} = require("../utils/consts/cms");

module.exports = function(sequelize, db) {

  const p = sequelize.define("report",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      visible: {
        type: db.BOOLEAN,
        defaultValue: true
      },
      date: {
        type: db.DATE,
        defaultValue: null
      },
      type: {
        type: db.STRING,
        defaultValue: REPORT_TYPES.REPORT
      },
      settings: {
        type: db.JSON,
        default: {}
      },
      ordering: db.INTEGER
    },
    {
      tableName: "canon_reports_report",
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.hasMany(models.report_meta, {foreignKey: "report_id", sourceKey: "id", as: "meta"});
    p.hasMany(models.report_content, {foreignKey: "id", sourceKey: "id", as: "contentByLocale"});
    p.hasMany(models.section, {foreignKey: "report_id", sourceKey: "id", as: "sections"});
  };

  return p;

};
