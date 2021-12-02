module.exports = function(sequelize, db) {

  const p = sequelize.define("report_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_reports_report",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      content: {
        type: db.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: "canon_reports_report_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
