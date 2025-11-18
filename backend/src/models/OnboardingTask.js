const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OnboardingTask = sequelize.define('OnboardingTask', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'module_id'
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    taskType: {
      type: DataTypes.STRING(50),
      defaultValue: 'manual',
      field: 'task_type'
    },
    taskMetadata: {
      type: DataTypes.JSONB,
      field: 'task_metadata'
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
    }
  }, {
    tableName: 'onboarding_tasks',
    timestamps: true,
    underscored: true
  });

  OnboardingTask.associate = (models) => {
    OnboardingTask.belongsTo(models.OnboardingModule, { foreignKey: 'moduleId', as: 'Module' });
    OnboardingTask.hasMany(models.UserTaskProgress, { foreignKey: 'taskId', as: 'Progress' });
  };

  return OnboardingTask;
};
