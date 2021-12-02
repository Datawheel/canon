module.exports = function(sequelize, db) {

  const section = sequelize.define("section",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      /* metadata */
      settings: {
        type: db.JSON,
        defaultValue: {}
      },
      heading: {
        type: db.INTEGER,
        defaultValue: 1
      },
      ordering: db.INTEGER,

      /* relations */
      report_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_reports_report",
          key: "id"
        }
      }
    },
    {
      tableName: "canon_reports_section",
      freezeTableName: true,
      timestamps: false
    }
  );

  section.associate = models => {
    section.hasMany(models.section_content, {foreignKey: "id", sourceKey: "id", as: "contentByLocale"});
    section.hasMany(models.block, {foreignKey: "section_id", sourceKey: "id", as: "blocks"});
  };

  return section;

};
