module.exports = function(sequelize, db) {

  const p = sequelize.define("report_tesseract_meta",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      report_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_reports_report_tesseract_meta",
          key: "id"
        }
      },
      slug: {
        type: db.STRING,
        defaultValue: ""
      },
      dimension: db.STRING,
      levels: db.ARRAY(db.TEXT),
      measure: db.STRING,
      ordering: db.INTEGER,
      cubeName: db.STRING,
      visible: {
        type: db.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "canon_reports_report_tesseract_meta",
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.hasMany(models.tesseract, {foreignKey: "cubeName", sourceKey: "cubeName", as: "members", constraints: false});
    p.belongsTo(models.report, {foreignKey: "id", sourceKey: "report_id", as: "report", constraints: false});
  };

  return p;

};