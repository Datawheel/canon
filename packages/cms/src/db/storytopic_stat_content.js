module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_stat_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "storytopic_stat",
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
        type: db.STRING,
        defaultValue: "New Subtitle"
      },      
      value: {
        type: db.STRING,
        defaultValue: "New Value"
      },      
      tooltip: {
        type: db.STRING,
        defaultValue: "New Tooltip"
      }
    }, 
    {
      tableName: "canon_cms_storytopic_stat_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
