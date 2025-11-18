const { OnboardingModule, OnboardingTask, UserTaskProgress, User } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Get user's onboarding progress
// @route   GET /api/v1/onboarding/progress
// @access  Private
exports.getMyProgress = async (req, res, next) => {
  try {
    const modules = await OnboardingModule.findAll({
      include: [{
        model: OnboardingTask,
        as: 'Tasks',
        include: [{
          model: UserTaskProgress,
          as: 'Progress',
          where: { userId: req.user.id },
          required: false
        }]
      }],
      order: [['sequenceOrder', 'ASC'], [{ model: OnboardingTask, as: 'Tasks' }, 'sequenceOrder', 'ASC']]
    });

    const stats = await UserTaskProgress.findAll({
      where: { userId: req.user.id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.status(200).json({
      success: true,
      data: { modules, stats, user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mentee progress (for mentors)
// @route   GET /api/v1/onboarding/mentees/:userId
// @access  Private (Mentor, Admin)
exports.getMenteeProgress = async (req, res, next) => {
  try {
    const mentee = await User.findByPk(req.params.userId, {
      include: [{
        model: UserTaskProgress,
        as: 'TaskProgress',
        include: [{ model: OnboardingTask, as: 'Task' }]
      }]
    });

    if (!mentee) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if requester is mentor or admin
    if (mentee.mentorId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: mentee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task progress
// @route   PUT /api/v1/onboarding/tasks/:taskId
// @access  Private
exports.updateTaskProgress = async (req, res, next) => {
  try {
    const { status, notes, quizScore } = req.body;

    const [progress, created] = await UserTaskProgress.findOrCreate({
      where: { userId: req.user.id, taskId: req.params.taskId },
      defaults: { status: 'NotStarted' }
    });

    const updateData = { status, notes };
    if (status === 'InProgress' && !progress.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'Completed') {
      updateData.completedAt = new Date();
    }
    if (quizScore !== undefined) {
      updateData.quizScore = quizScore;
    }

    await progress.update(updateData);

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all onboarding modules (Admin)
// @route   GET /api/v1/onboarding/modules
// @access  Private (Admin)
exports.getModules = async (req, res, next) => {
  try {
    const modules = await OnboardingModule.findAll({
      include: [{ model: OnboardingTask, as: 'Tasks' }],
      order: [['sequenceOrder', 'ASC']]
    });

    res.status(200).json({ success: true, data: modules });
  } catch (error) {
    next(error);
  }
};

// @desc    Create onboarding module (Admin)
// @route   POST /api/v1/onboarding/modules
// @access  Private (Admin)
exports.createModule = async (req, res, next) => {
  try {
    const module = await OnboardingModule.create(req.body);
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};
