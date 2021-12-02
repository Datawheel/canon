module.exports = function(sequelize, db) {

  const s = sequelize.define("tesseract_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_reports_tesseract",
          key: "contentId"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      name: db.TEXT,
      attr: db.JSONB,
      keywords: db.ARRAY(db.TEXT)
    },
    {
      tableName: "canon_reports_tesseract_content",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
