const express = require('express');
const {
  getSOPs,
  getSOP,
  createSOP,
  updateSOP,
  deleteSOP,
  submitFeedback
} = require('../controllers/sopController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSOPs)
  .post(authorize('Admin', 'Editor'), createSOP);

router.route('/:id')
  .get(getSOP)
  .put(authorize('Admin', 'Editor'), updateSOP)
  .delete(authorize('Admin'), deleteSOP);

router.post('/:id/feedback', submitFeedback);

module.exports = router;
