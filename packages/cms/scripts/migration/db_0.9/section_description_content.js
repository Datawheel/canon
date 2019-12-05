module.exports = function(sequelize, db) {

  const t = sequelize.define("section_description_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section_description",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      }
    }, 
    {
      tableName: "canon_cms_section_description_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
