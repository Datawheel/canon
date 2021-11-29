module.exports = function(sequelize, db) {

  const m = sequelize.define("story_materializer",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.TEXT,
        defaultValue: ""
      },
      description: {
        type: db.TEXT,
        defaultValue: ""
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      },
      ordering: db.INTEGER,
      story_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_story",
          key: "id"
        }
      },
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      }
    },
    {
      tableName: "canon_cms_story_materializer",
      freezeTableName: true,
      timestamps: false
    }
  );

  return m;

};
