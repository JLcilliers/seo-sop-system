const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Editor', 'Viewer', 'Mentor'),
      allowNull: false,
      defaultValue: 'Viewer'
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      field: 'hire_date'
    },
    onboardingStatus: {
      type: DataTypes.ENUM('PreDay1', 'Orientation', 'Training', 'Evaluation', 'Completed'),
      defaultValue: 'PreDay1',
      field: 'onboarding_status'
    },
    mentorId: {
      type: DataTypes.UUID,
      field: 'mentor_id'
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      field: 'avatar_url'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      }
    }
  });

  // Instance Methods
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  };

  // Associations
  User.associate = (models) => {
    // Self-referential for mentor
    User.belongsTo(models.User, { as: 'Mentor', foreignKey: 'mentorId' });
    User.hasMany(models.User, { as: 'Mentees', foreignKey: 'mentorId' });
    
    // SOP ownership
    User.hasMany(models.SOPDocument, { foreignKey: 'ownerUserId', as: 'OwnedSOPs' });
    
    // Task progress
    User.hasMany(models.UserTaskProgress, { foreignKey: 'userId', as: 'TaskProgress' });
    
    // Feedback
    User.hasMany(models.SOPFeedback, { foreignKey: 'userId', as: 'Feedback' });
    
    // Notifications
    User.hasMany(models.Notification, { foreignKey: 'userId', as: 'Notifications' });
  };

  return User;
};
