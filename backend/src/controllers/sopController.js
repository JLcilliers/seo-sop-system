const { SOPDocument, SOPVersion, SOPFeedback, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all SOPs with filtering and search
// @route   GET /api/v1/sops
// @access  Private
exports.getSOPs = async (req, res, next) => {
  try {
    const { category, status, search, tags, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (tags) where.tags = { [Op.contains]: tags.split(',') };
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { purpose: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await SOPDocument.findAndCountAll({
      where,
      include: [
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'] },
        { model: SOPFeedback, as: 'Feedback', attributes: ['rating', 'isHelpful'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single SOP
// @route   GET /api/v1/sops/:id
// @access  Private
exports.getSOP = async (req, res, next) => {
  try {
    const sop = await SOPDocument.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email'] },
        { model: SOPVersion, as: 'Versions', limit: 10, order: [['createdAt', 'DESC']] },
        { model: SOPFeedback, as: 'Feedback' }
      ]
    });

    if (!sop) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    res.status(200).json({ success: true, data: sop });
  } catch (error) {
    next(error);
  }
};

// @desc    Create SOP
// @route   POST /api/v1/sops
// @access  Private (Admin, Editor)
exports.createSOP = async (req, res, next) => {
  try {
    const sopData = {
      ...req.body,
      ownerUserId: req.user.id
    };

    const sop = await SOPDocument.create(sopData);

    res.status(201).json({ success: true, data: sop });
  } catch (error) {
    next(error);
  }
};

// @desc    Update SOP
// @route   PUT /api/v1/sops/:id
// @access  Private (Admin, Editor, Owner)
exports.updateSOP = async (req, res, next) => {
  try {
    let sop = await SOPDocument.findByPk(req.params.id);

    if (!sop) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    // Check ownership or admin/editor role
    if (sop.ownerUserId !== req.user.id && !['Admin', 'Editor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this SOP' });
    }

    await sop.update(req.body);

    res.status(200).json({ success: true, data: sop });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete SOP
// @route   DELETE /api/v1/sops/:id
// @access  Private (Admin only)
exports.deleteSOP = async (req, res, next) => {
  try {
    const sop = await SOPDocument.findByPk(req.params.id);

    if (!sop) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    await sop.destroy();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit SOP feedback
// @route   POST /api/v1/sops/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res, next) => {
  try {
    const feedback = await SOPFeedback.create({
      sopDocumentId: req.params.id,
      userId: req.user.id,
      ...req.body
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};
