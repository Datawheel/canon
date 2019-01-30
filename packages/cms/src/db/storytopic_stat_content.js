module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_stat_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
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
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "storytopic_stat",
          key: "id"
        }
      },
      tooltip: {
        type: db.STRING,
        defaultValue: "New Tooltip"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
