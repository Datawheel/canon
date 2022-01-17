module.exports = function(sequelize, db) {

  const s = sequelize.define("storysection_selector",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      storysection_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storysection",
          key: "id"
        }
      },
      story_selector_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_story_selector",
          key: "id"
        }
      },
      ordering: db.INTEGER
    },
    {
      tableName: "canon_cms_storysection_selector",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
