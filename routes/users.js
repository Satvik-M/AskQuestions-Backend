const express = require("express");
const router = express.Router();
const User = require("../models/users");
const UserVerification = require("../models/userVerification");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { validateUser } = require("../middleware");
const { authMail } = require("../mail");
// authMail("satvikmakharia@gmail.com");

router.get("/register", async (req, res) => {
  res.render("users/register");
});

router.get(
  "/activate/:v_id",
  catchAsync(async (req, res) => {
    const link = await UserVerification.findById(req.params.v_id);
    if (!link) {
      req.flash(
        "error",
        "Sorry, some error occured. Either you have already verified or your token has expired. Please register again for latter."
      );
    } else {
      let diff = Date.now() - link.time;
      diff = diff / (1000 * 60 * 60);
      console.log(diff);
      if (diff <= 24) {
        req.flash("success", "Account verified successfully");
        await User.findByIdAndUpdate(link.user, { isVerified: true });
        await UserVerification.findByIdAndDelete(req.params.v_id);
      } else {
        req.flash("error", "Token has expired. Please register again");
        return res.redirect("/users/register");
      }
    }
    res.redirect("/users/login");
  })
);

router.post(
  "/register",
  validateUser,
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const regUser = await User.register(user, password);
      const link = new UserVerification({ user: user._id, time: Date.now() });
      await link.save();
      // change the link to your own after hosting the site
      const verify = `https://aqueous-lake-75452.herokuapp.com/users/activate/${link._id}`;
      authMail(email, verify);
      console.log(regUser);
      req.flash(
        "success",
        "Successfully registered, Please check your mail account for verification mail"
      );
      res.redirect("/questions");
    } catch (e) {
      console.log(e);
      req.flash("error", e.message);
      return res.redirect("/users/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  catchAsync(async (req, res) => {
    req.flash("success", "Welcome");
    res.redirect("/questions");
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged out successfully");
  res.redirect("/questions");
});

module.exports = router;
