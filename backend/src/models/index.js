const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

const models = {};

// Import all model files
const modelFiles = [
  'User',
  'SOPDocument',
  'SOPVersion',
  'SOPFeedback',
  'OnboardingModule',
  'OnboardingTask',
  'UserTaskProgress',
  'Notification',
  'ActivityLog'
];

// Initialize models
modelFiles.forEach(file => {
  try {
    const model = require(path.join(__dirname, file))(sequelize);
    models[model.name] = model;
  } catch (err) {
    console.warn(`Model ${file} not loaded:`, err.message);
  }
});

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;

module.exports = models;
