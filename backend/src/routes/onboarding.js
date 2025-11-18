const express = require('express');
const {
  getMyProgress,
  getMenteeProgress,
  updateTaskProgress,
  getModules,
  createModule
} = require('../controllers/onboardingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/progress', getMyProgress);
router.get('/mentees/:userId', authorize('Mentor', 'Admin'), getMenteeProgress);
router.put('/tasks/:taskId', updateTaskProgress);

router.route('/modules')
  .get(authorize('Admin'), getModules)
  .post(authorize('Admin'), createModule);

module.exports = router;
