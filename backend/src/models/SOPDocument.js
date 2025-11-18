const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SOPDocument = sequelize.define('SOPDocument', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('TechnicalSEO', 'Content', 'LinkBuilding', 'Analytics', 'ToolAccess', 'General'),
      allowNull: false
    },
    subcategory: {
      type: DataTypes.STRING(255)
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    scope: {
      type: DataTypes.TEXT
    },
    ownerUserId: {
      type: DataTypes.UUID,
      field: 'owner_user_id'
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Published', 'Archived'),
      allowNull: false,
      defaultValue: 'Draft'
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'v1.0'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    reviewIntervalDays: {
      type: DataTypes.INTEGER,
      defaultValue: 90,
      field: 'review_interval_days'
    },
    lastReviewDate: {
      type: DataTypes.DATEONLY,
      field: 'last_review_date'
    },
    publishedAt: {
      type: DataTypes.DATE,
      field: 'published_at'
    },
    archivedAt: {
      type: DataTypes.DATE,
      field: 'archived_at'
    }
  }, {
    tableName: 'sop_documents',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeUpdate: async (sop, options) => {
        // Create version snapshot before update
        if (sop.changed('content') || sop.changed('version')) {
          const { SOPVersion } = sequelize.models;
          const previousVersion = sop._previousDataValues;
          
          await SOPVersion.create({
            sopDocumentId: sop.id,
            version: previousVersion.version,
            content: previousVersion.content,
            changedBy: sop.ownerUserId
          }, { transaction: options.transaction });
        }
      }
    }
  });

  // Instance Methods
  SOPDocument.prototype.publish = async function() {
    this.status = 'Published';
    this.publishedAt = new Date();
    await this.save();
  };

  SOPDocument.prototype.archive = async function() {
    this.status = 'Archived';
    this.archivedAt = new Date();
    await this.save();
  };

  // Associations
  SOPDocument.associate = (models) => {
    SOPDocument.belongsTo(models.User, { foreignKey: 'ownerUserId', as: 'Owner' });
    SOPDocument.hasMany(models.SOPVersion, { foreignKey: 'sopDocumentId', as: 'Versions' });
    SOPDocument.hasMany(models.SOPFeedback, { foreignKey: 'sopDocumentId', as: 'Feedback' });
  };

  return SOPDocument;
};
