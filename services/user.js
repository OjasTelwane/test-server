exports.signup = async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, empId, email, password } = req.body;
    try {
      //check if user exists
      let user = await User.findOne({ empId });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      user = new User({
        name,
        empId,
        email,
        password
      });
      //Get users avatar TODO

      //encrypt password
      const salt = await bcrypt.genSalt(10); // more you have the more secured
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //return jwt (so the user can log in as soon as they register)
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get('jwtToken'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
}