const express        = require("express");
const passportRouter = express.Router();
// Require user model
const User = require(`../models/user`);

// Add bcrypt to encrypt passwords
const bcrypt = require(`bcrypt`);
const bcryptSalt = 10;
const salt = bcrypt.genSaltSync(bcryptSalt);

// Add passport 
const passport = require(`passport`);

passportRouter.get(`/signup`, (req,res,next) => {
  res.render(`passport/signup`);
});

passportRouter.post(`/signup`, (req,res,next) => {
  const { username, password } = req.body;

  if(username.length <= 0 || password.length <= 0) {
    res.render(`passport/signup`, {
      errorMessage: `Please fill both username and password`
    });
    return;
  }
  
  const hashPass = bcrypt.hashSync(password, salt);

  User.create({
    username,
    password: hashPass
  })
    .then(
      res.redirect(`/`)
    )
    .catch(err => next(err));
});

passportRouter.get(`/login`, (req,res,next) => {
  if(req.user) {
    res.redirect(`/private-page`)
  } else {
    res.render(`passport/login`)
  }
});

passportRouter.post(`/login`, passport.authenticate(`local`, {
  successRedirect: `/private-page`,
  failureRedirect: `/login`
}));

passportRouter.get(`/auth/slack`, passport.authenticate(`slack`));

passportRouter.get(`/auth/slack/callback`, passport.authenticate(`slack`, {
  successRedirect: `/private-page`,
  failureRedirect: `/login`
}));

passportRouter.get(`/auth/google`, passport.authenticate(`google`, {
  scope: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
}));

passportRouter.get(`/auth/google/callback`, passport.authenticate(`google`, {
  successRedirect: `/private-page`,
  failureRedirect: `/login`
}))

passportRouter.get(`/private-page`, (req, res) => {
  if(!req.user) {
    res.redirect(`/login`);
    return;
  }

  res.render(`passport/private`, { user: req.user });
});

passportRouter.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = passportRouter;