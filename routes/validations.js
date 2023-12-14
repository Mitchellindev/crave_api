const { body, validationResult } = require('express-validator');
const User = require('../models/authModel')
const bcrypt = require('bcrypt')


exports.validateSignup = [
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error('Email is already registered');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match the password');
    }
    return true;
  }),
];


exports.validateLogin = [
    body('email')
    .isEmail().withMessage('Invalid email format')
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (!user) {
        throw new Error('User with this email does not exist');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: req.body.email });
      if (user && !(await bcrypt.compare(value, user.password))) {
        throw new Error('Incorrect password');
      }
      return true;
    }),
  ];

  exports.validateForgotPassword = [
    body('email')
    .isEmail().withMessage('Invalid email format')
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (!user) {
        throw new Error('User with this email does not exist');
      }
      return true;
    }),
  ];

  exports.validateResetPassword = [
    body('verificationCode')
    .isLength({ min: 6 })
    .withMessage('Invalid verification code'),
    body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newpassword) {
      throw new Error('Password confirmation does not match the newpassword');
    }
    return true;
  }),
  ];