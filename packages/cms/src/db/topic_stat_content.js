module.exports = function(sequelize, db) {

  const s = sequelize.define("topic_stat_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "topic_stat",
          key: "id"
        }        
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Stat"
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },      
      value: {
        type: db.STRING,
        defaultValue: "New Value"
      },
      tooltip: {
        type: db.TEXT,
        defaultValue: "New Tooltip"
      }
    }, 
    {
      tableName: "canon_cms_topic_stat_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
