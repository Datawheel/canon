import {PROFILE_TYPES} from "../utils/consts/cms";

module.exports = function(sequelize, db) {

  const p = sequelize.define("profile",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      visible: {
        type: db.BOOLEAN,
        defaultValue: true
      },
      date: {
        type: db.DATE,
        defaultValue: "2018-01-01 00:00:00"
      },
      type: {
        type: db.STRING,
        defaultValue: PROFILE_TYPES.PROFILE
      },
      ordering: db.INTEGER
    },
    {
      tableName: "canon_cms_profile",
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.hasMany(models.profile_meta, {foreignKey: "profile_id", sourceKey: "id", as: "meta"});
    p.hasMany(models.profile_content, {foreignKey: "id", sourceKey: "id", as: "content"});
    p.hasMany(models.section, {foreignKey: "profile_id", sourceKey: "id", as: "sections"});
  };

  return p;

};
