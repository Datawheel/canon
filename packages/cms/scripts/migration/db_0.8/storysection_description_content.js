module.exports = function(sequelize, db) {

  const s = sequelize.define("storysection_description_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storysection_description",
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
      tableName: "canon_cms_storysection_description_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
