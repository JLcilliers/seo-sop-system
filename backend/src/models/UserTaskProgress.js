const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserTaskProgress = sequelize.define('UserTaskProgress', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'task_id'
    },
    status: {
      type: DataTypes.ENUM('NotStarted', 'InProgress', 'Completed'),
      defaultValue: 'NotStarted'
    },
    startedAt: {
      type: DataTypes.DATE,
      field: 'started_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    },
    notes: {
      type: DataTypes.TEXT
    },
    quizScore: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'quiz_score'
    }
  }, {
    tableName: 'user_task_progress',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['user_id', 'task_id'] }]
  });

  UserTaskProgress.associate = (models) => {
    UserTaskProgress.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    UserTaskProgress.belongsTo(models.OnboardingTask, { foreignKey: 'taskId', as: 'Task' });
  };

  return UserTaskProgress;
};
