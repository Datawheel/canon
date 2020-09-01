module.exports = function(sequelize, db) {

  const levelsType = process.env.CANON_DB_ENGINE === "sqlite" ? db.JSON : db.ARRAY(db.TEXT);

  const p = sequelize.define("profile_meta",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_profile",
          key: "id"
        }
      },
      slug: {
        type: db.STRING,
        defaultValue: ""
      },
      dimension: db.STRING,
      levels: levelsType,
      measure: db.STRING,
      ordering: db.INTEGER,
      cubeName: db.STRING
    },
    {
      tableName: "canon_cms_profile_meta",
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
