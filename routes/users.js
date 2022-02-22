const express = require("express");
const router = express.Router();
const User = require("../models/users");
const UserVerification = require("../models/userVerification");
const catchAsync = require("../utils/catchAsync");
const { validateUser } = require("../middleware");
const { authMail } = require("../mail");
const jwt = require("jsonwebtoken");
// authMail("satvikmakharia@gmail.com");
const bcrypt = require("bcrypt");
const ResetPassword = require("../models/resetPassword");

router.get(
  "/activate/:v_id",
  catchAsync(async (req, res) => {
    const link = await UserVerification.findById(req.params.v_id);
    if (!link) {
      res.status(400).json({
        message:
          "Sorry, some error occured. Either you have already verified or your token has expired. Please register again for latter.",
      });
    } else {
      let diff = Date.now() - link.time;
      diff = diff / (1000 * 60 * 60);
      console.log(diff);
      if (diff <= 24) {
        await User.findByIdAndUpdate(link.user, { isVerified: true });
        await UserVerification.findByIdAndDelete(req.params.v_id);
        res.json({ message: "Account verified successfully" });
      } else {
        res
          .status(400)
          .json({ message: "Token has expired. Please register again" });
      }
    }
  })
);

router.post(
  "/register",
  validateUser,
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      let check = await User.findOne({ username: username });
      if (check)
        return res.status(401).json({ message: "Username already exists" });
      check = await User.findOne({ email: email });
      if (check)
        return res.status(401).json({ message: "Email already exists" });
      const salt = await bcrypt.genSalt(10);
      console.log("salt", salt);
      const hash = await bcrypt.hash(password, salt);
      const newUser = new User({
        username: username,
        password: hash,
        email: email,
        isVerified: false,
      });
      const regUser = await newUser.save();
      const link = new UserVerification({
        user: regUser._id,
        time: Date.now(),
      });
      await link.save();
      // change the link to your own after hosting the site
      // const verify = `https://aqueous-lake-75452.herokuapp.com/users/activate/${link._id}`;
      const verify = `http://localhost:4200/activate/${link._id}`;
      authMail(email, verify);
      console.log(regUser);

      const token = jwt.sign({ userid: regUser._id }, "secret", {
        expiresIn: 36000,
      });
      return res.json({ user: regUser, token, expiresIn: 35000 * 1000 });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Some error occured" });
    }
  })
);

router.post(
  "/login",
  catchAsync(async (req, res) => {
    const data = req.body;
    const user = await User.findOne({ email: data.email });
    if (!user)
      return res
        .status(400)
        .json({ message: "No account with the given email id" });
    const check = await bcrypt.compare(data.password, user.password);
    if (!check) return res.status(401).json({ message: "Wrong Password" });
    console.log(user);
    const token = jwt.sign({ userid: user._id }, "secret", {
      expiresIn: 36000,
    });
    return res.json({ user, token, expiresIn: 35000 * 1000 });
  })
);
router.get(
  "/login/jwt",
  catchAsync(async (req, res) => {
    const token = req.query.token;
    let check = jwt.verify(token, "secret", async (err, decoded) => {
      if (!err) {
        console.log(decoded);
        const user = await User.findById(decoded.userid);
        if (!user)
          return res
            .status(400)
            .json({ message: "No account with the given email id" });
        else {
          return res.json(user);
        }
      } else {
        console.log(err);
        return res.status(400).json({ message: "Auto login failed" });
      }
    });
  })
);

module.exports = router;
