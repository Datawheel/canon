module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_subtitle_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "storytopic_subtitle",
          key: "id"
        }
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
