module.exports = function(sequelize, db) {

  const s = sequelize.define("storysection_stat_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storysection_stat",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: ""
      },
      subtitle: {
        type: db.STRING,
        defaultValue: ""
      },      
      value: {
        type: db.STRING,
        defaultValue: ""
      },      
      tooltip: {
        type: db.STRING,
        defaultValue: ""
      }
    }, 
    {
      tableName: "canon_cms_storysection_stat_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
