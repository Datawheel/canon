module.exports = function(sequelize, db) {

  const t = sequelize.define("section_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_reports_section",
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
      tableName: "canon_reports_section_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
