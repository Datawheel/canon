module.exports = function(sequelize, db) {

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
        defaultValue: "new-profile-slug"
      },
      dimension: db.STRING,
      levels: db.ARRAY(db.TEXT),
      measure: db.STRING,
      ordering: db.INTEGER
    },
    {
      tableName: "canon_cms_profile_meta",
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
