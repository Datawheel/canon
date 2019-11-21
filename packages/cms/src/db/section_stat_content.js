module.exports = function(sequelize, db) {

  const s = sequelize.define("section_stat_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section_stat",
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
        type: db.TEXT
      },      
      value: {
        type: db.STRING
      },
      tooltip: {
        type: db.TEXT
      }
    }, 
    {
      tableName: "canon_cms_section_stat_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
