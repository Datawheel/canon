module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "storytopic",
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
      freezeTableName: true,
      timestamps: false
    }
  );  

  return s;

};
