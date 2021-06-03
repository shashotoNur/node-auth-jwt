const User = require("../models/User");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/creds');
const bcrypt = require('bcrypt');

// handle errors
const handleErrors = (err) =>
{
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // any unknown type of error
  if (err.message) errors.password = 'An error occured';

  // incorrect email
  if (err.message === 'incorrect email') errors.email = 'That email is not registered';

  // incorrect password
  if (err.message === 'incorrect password') errors.password = 'That password is incorrect';

  // short password
  if (err.message === 'too short') errors.password = 'Minimum password length is 6 characters';

  // duplicate email error
  if (err.code === 11000) errors.email = 'that email is already registered';

  // validation errors
  if (err.message.includes('user validation failed')){
    Object.values(err.errors).forEach(({ properties }) => { errors[properties.path] = properties.message; });
  };

  // email does not exist
  if (err.message === `Cannot read property 'password' of null`) errors.password = 'Account does not exist';

  return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60; // 3 days
const createToken = (id) => { return jwt.sign({ id }, secretKey, { expiresIn: maxAge }); };

// controller actions
module.exports.signup_get = (_req, res) => { res.render('signup'); };

module.exports.login_get = (_req, res) => { res.render('login'); };

module.exports.delete_get = (_req, res) => { res.render('delete'); };

module.exports.updatePassword_get = (_req, res) => { res.render('password_update'); };

module.exports.signup_post = async (req, res) =>
  {
    const { email, password } = req.body;

    try
    {
      const user = await User.create({ email, password });
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json({ user: user._id });
    }

    catch(err)
    {
      const errors = handleErrors(err);
      console.log(err)
      res.status(400).json({ errors });
    }
  };

module.exports.login_post = async (req, res) =>
  {
    const { email, password } = req.body;

    try
    {
      const user = await User.login(email, password);
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
    }

    catch (err)
    {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  };

module.exports.logout_get = (_req, res) =>
  {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  };

module.exports.delete_post = async (req, res) =>
  {
    const { email, password } = req.body;

    try
    {
      const user = await User.findOne({ email });
    
      const auth = await bcrypt.compare(password, user.password);
      if (auth)
      {
        await User.findByIdAndDelete(user._id);
        res.cookie('jwt', '', { maxAge: 1 });
        res.status(200).json({ user: user._id });
      }
      else throw Error('incorrect password');
    }

    catch (err)
    {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  };

module.exports.updatePassword_post = async (req, res) =>
  {
    const { email, password } = req.body;
    var { newPassword } = req.body;

    try
    {
      var user = await User.findOne({ email });
    
      const auth = await bcrypt.compare(password, user.password);
      if (auth)
      {
        if(newPassword.length >= 5)
        {
          const salt = await bcrypt.genSalt();
          newPassword = await bcrypt.hash(newPassword, salt);
          user = await User.findByIdAndUpdate(user._id, { password: newPassword });
          res.status(200).json({ user: user._id });
        }
        else throw Error('too short');
      }
      else throw Error('incorrect password');
    }

    catch (err)
    {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  };