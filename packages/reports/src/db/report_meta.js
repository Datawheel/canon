module.exports = function(sequelize, db) {

  const p = sequelize.define("report_meta",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      report_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_reports_report",
          key: "id"
        }
      },
      slug: {
        type: db.STRING,
        defaultValue: ""
      },
      accessor: {
        type: db.STRING,
        defaultValue: ""
      },
      path: {
        type: db.STRING,
        defaultValue: ""
      },
      namespace: {
        type: db.STRING,
        defaultValue: ""
      },
      properties: {
        type: db.JSONB,
        defaultValue: {}
      },
      ordering: db.INTEGER,
      visible: {
        type: db.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "canon_reports_report_meta",
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.hasMany(models.search, {foreignKey: "namespace", sourceKey: "namespace", as: "members", constraints: false});
    p.belongsTo(models.report, {foreignKey: "id", sourceKey: "report_id", as: "report", constraints: false});
  };

  return p;

};
