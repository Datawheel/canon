module.exports = function(sequelize, db) {

  const search = sequelize.define("search",
    {
      id: {
        primaryKey: true,
        type: db.TEXT
      },
      zvalue: db.DOUBLE,
      dimension: db.TEXT,
      name: db.TEXT,
      display: db.TEXT,
      hierarchy: db.TEXT,
      stem: db.INTEGER,
      slug: db.TEXT,
      keywords: db.ARRAY(db.TEXT),
      imageId: db.INTEGER
    },
    {
      freezeTableName: true,
      indexes: [
        {
          unique: true,
          fields: ["name", "id", "dimension", "hierarchy"]
        }
      ],
      timestamps: false
    }
  );

  return search;

};
