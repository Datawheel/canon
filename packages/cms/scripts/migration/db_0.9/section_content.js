module.exports = function(sequelize, db) {

  const t = sequelize.define("section_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Section"
      }
    }, 
    {
      tableName: "canon_cms_section_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
