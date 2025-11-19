const { sequelize } = require('../config/database');
const models = require('../models');
const fs = require('fs');
const path = require('path');

// Load seed data from JSON file
const seedDataPath = path.join(__dirname, 'seo_sop_seed.json');
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

// Category mapping from seed data to database ENUM
const categoryMap = {
  'Foundations': 'General',
  'Technical SEO': 'TechnicalSEO',
  'Content / Audits': 'Content',
  'Content Marketing': 'Content',
  'EEAT & Quality': 'Content',
  'Off-Page / Link Building': 'LinkBuilding',
  'Audits & Analysis': 'Analytics',
  'Local SEO': 'TechnicalSEO'
};

// Phase mapping for onboarding
const phaseMap = {
  1: 'Orientation',
  2: 'Orientation'
};

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // Sync database first
    await sequelize.sync();
    console.log('✓ Database synced');

    // Seed SOPs
    console.log('\nSeeding SOPs...');
    for (const sop of seedData.sops) {
      const dbCategory = categoryMap[sop.category] || 'General';

      await models.SOPDocument.create({
        title: sop.title,
        category: dbCategory,
        purpose: sop.description,
        content: sop.content,
        status: 'Published',
        version: 'v1.0',
        tags: [sop.category, sop.source_file],
        publishedAt: new Date()
      });

      console.log(`  ✓ Created: ${sop.title}`);
    }

    // Seed Onboarding Modules
    console.log('\nSeeding Onboarding Modules...');
    for (const module of seedData.onboarding_modules) {
      const dbModule = await models.OnboardingModule.create({
        title: module.title,
        description: module.description,
        phase: phaseMap[module.sequence] || 'Orientation',
        sequenceOrder: module.sequence,
        isRequired: true,
        estimatedHours: module.sequence === 1 ? 4 : 6
      });

      console.log(`  ✓ Created Module: ${module.title}`);

      // Create tasks for this module
      for (let i = 0; i < module.steps.length; i++) {
        await models.OnboardingTask.create({
          moduleId: dbModule.id,
          title: module.steps[i],
          description: module.steps[i],
          taskType: 'manual',
          taskMetadata: {
            resources: module.resources
          },
          sequenceOrder: i + 1,
          isRequired: true
        });
      }

      console.log(`    ✓ Created ${module.steps.length} tasks for ${module.title}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\nSeeded:`);
    console.log(`  - ${seedData.sops.length} SOPs`);
    console.log(`  - ${seedData.onboarding_modules.length} Onboarding Modules`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
