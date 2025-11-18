const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SOPVersion = sequelize.define('SOPVersion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sopDocumentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sop_document_id'
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    changedBy: {
      type: DataTypes.UUID,
      field: 'changed_by'
    },
    changeSummary: {
      type: DataTypes.TEXT,
      field: 'change_summary'
    }
  }, {
    tableName: 'sop_versions',
    timestamps: true,
    underscored: true,
    updatedAt: false
  });

  SOPVersion.associate = (models) => {
    SOPVersion.belongsTo(models.SOPDocument, { foreignKey: 'sopDocumentId', as: 'Document' });
    SOPVersion.belongsTo(models.User, { foreignKey: 'changedBy', as: 'ChangedByUser' });
  };

  return SOPVersion;
};
