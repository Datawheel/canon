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
        type: db.STRING
      },
      subtitle: {
        type: db.STRING
      },      
      value: {
        type: db.STRING
      },      
      tooltip: {
        type: db.STRING
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
