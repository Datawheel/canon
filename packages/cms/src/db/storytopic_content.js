module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storytopic",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New StoryTopic"
      }
    }, 
    {
      tableName: "canon_cms_storytopic_content",
      freezeTableName: true,
      timestamps: false
    }
  );  

  return s;

};
