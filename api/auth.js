const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Users = require('../models/Users');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
// @route GET api/auth
// @desc  verify user
// @access Public
router.get('/authenticate', auth.verifyUser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error in api/authentication');
  }
});
// @route POST api/auth
// @desc  verify user
// @access Public
router.post(
  '/login',
  [
    check('empId', 'Employee ID is required').not().isEmpty(),
    check('password', 'Please enter a password').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { empId, password } = req.body;
    try {
      //find user
      let user = await Users.findOne({ empId });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      //Match id and password
      const isMatched = await bcrypt.compare(password, user.password);
      if (!isMatched) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      const payload = {
        user: {
          id: user.id,
          empId: user.empId
        }
      };

      jwt.sign(
        payload,
        config.get('jwtToken'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token: token,
            empId: +empId
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

module.exports = router;
