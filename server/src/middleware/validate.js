const { body, validationResult } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 60 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').optional().isIn(['customer', 'agent', 'admin']).withMessage('Invalid role')
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required')
];

const ticketRules = [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description required').isLength({ max: 5000 }),
  body('category').optional().trim().isLength({ max: 40 })
];

const messageRules = [body('text').trim().notEmpty().withMessage('Text required').isLength({ max: 2000 })];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
}

module.exports = { registerRules, loginRules, ticketRules, messageRules, validate };
