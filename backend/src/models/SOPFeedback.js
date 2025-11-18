const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SOPFeedback = sequelize.define('SOPFeedback', {
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
    userId: {
      type: DataTypes.UUID,
      field: 'user_id'
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 }
    },
    comment: {
      type: DataTypes.TEXT
    },
    isHelpful: {
      type: DataTypes.BOOLEAN,
      field: 'is_helpful'
    }
  }, {
    tableName: 'sop_feedback',
    timestamps: true,
    underscored: true,
    updatedAt: false
  });

  SOPFeedback.associate = (models) => {
    SOPFeedback.belongsTo(models.SOPDocument, { foreignKey: 'sopDocumentId', as: 'Document' });
    SOPFeedback.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
  };

  return SOPFeedback;
};
