const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OnboardingModule = sequelize.define('OnboardingModule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    phase: {
      type: DataTypes.ENUM('Preparation', 'Orientation', 'Training', 'Evaluation'),
      allowNull: false
    },
    sequenceOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sequence_order'
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_required'
    },
    content: {
      type: DataTypes.TEXT
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(4, 2),
      field: 'estimated_hours'
    },
    linkedSopIds: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      field: 'linked_sop_ids'
    }
  }, {
    tableName: 'onboarding_modules',
    timestamps: true,
    underscored: true
  });

  OnboardingModule.associate = (models) => {
    OnboardingModule.hasMany(models.OnboardingTask, { foreignKey: 'moduleId', as: 'Tasks' });
  };

  return OnboardingModule;
};
