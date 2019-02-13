module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_subtitle_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "storytopic_subtitle",
          key: "id"
        }
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
