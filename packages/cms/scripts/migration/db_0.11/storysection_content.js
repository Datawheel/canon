module.exports = function(sequelize, db) {

  const s = sequelize.define("storysection_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storysection",
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
      tableName: "canon_cms_storysection_content",
      freezeTableName: true,
      timestamps: false
    }
  );  

  return s;

};
