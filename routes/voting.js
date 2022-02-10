const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Answer = require("../models/answers");
const Question = require("../models/question");
const {
  validateAnswer,
  validateQuestion,
  isLoggedIn,
  isAnswerAuthor,
} = require("../middleware");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

router.get(
  "/answers/:a_id/upvote",
  // isLoggedIn,
  catchAsync(async (req, res) => {
    let user;
    const token = req.query.token;
    jwt.verify(token, "secret", async (err, decoded) => {
      if (!err) {
        user = decoded;
      } else {
        console.log(err);
      }
    });
    if (!user) res.status(400).json("No user");
    const ans = await Answer.findById(req.params.a_id);
    let check = true;
    for (vote of ans.votes) {
      console.log(vote);
      if (vote.user == user.userid) {
        check = false;
        if (vote.value === -1) {
          console.log("same person");
          ans.upvotes += 2;
          vote.value = 1;
        }
      }
    }
    console.log(ans.votes);
    if (check) {
      console.log("new vote");
      ans.upvotes = ans.upvotes + 1;
      ans.votes.push({
        user: user.userid,
        value: +1,
      });
    }
    await ans.save();
    res.json({ answer: ans });
  })
);
router.get(
  "/answers/:a_id/downvote",
  // isLoggedIn,
  catchAsync(async (req, res) => {
    let user;
    const token = req.query.token;
    jwt.verify(token, "secret", async (err, decoded) => {
      if (!err) {
        user = decoded;
      } else {
        console.log(err);
      }
    });
    if (!user) res.status(400).json("No user");
    const ans = await Answer.findById(req.params.a_id);
    let check = true;
    for (vote of ans.votes) {
      console.log(vote);
      if (vote.user == user.userid) {
        check = false;
        if (vote.value === 1) {
          console.log("same person");
          ans.upvotes -= 2;
          vote.value = -1;
        }
      }
    }
    console.log(ans.votes);
    if (check) {
      console.log("new vote");
      ans.upvotes = ans.upvotes - 1;
      ans.votes.push({
        user: user.userid,
        value: -1,
      });
    }
    await ans.save();
    res.json({ answer: ans });
  })
);
router.get(
  "/upvote",
  // isLoggedIn,
  catchAsync(async (req, res) => {
    let user;
    const ques = await Question.findById(req.params.id);
    const token = req.query.token;
    jwt.verify(token, "secret", async (err, decoded) => {
      if (!err) {
        user = decoded;
        console.log(user);
      } else {
        console.log(err);
      }
    });
    let check = true;
    // console.log(ques.votes);
    for (vote of ques.votes) {
      // console.log(vote);
      if (vote.user == user.userid) {
        check = false;
        if (vote.value === -1) {
          ques.upvotes += 2;
          vote.value = 1;
        }
      }
    }
    console.log(ques.votes);
    if (check) {
      ques.upvotes = ques.upvotes + 1;
      ques.votes.push({
        user: user.userid,
        value: 1,
      });
    }
    ques.save();
    res.json({ question: ques });
  })
);
router.get(
  "/downvote",
  // isLoggedIn,
  catchAsync(async (req, res) => {
    let user;
    const token = req.query.token;
    jwt.verify(token, "secret", async (err, decoded) => {
      if (!err) {
        user = decoded;
      } else {
        console.log(err);
      }
    });
    if (!user) res.status(400).json("No user");
    const ques = await Question.findById(req.params.id);
    let check = true;
    for (vote of ques.votes) {
      console.log(vote);
      if (vote.user == user.userid) {
        check = false;
        if (vote.value === 1) {
          console.log("same person");
          ques.upvotes -= 2;
          vote.value = -1;
        }
      }
    }
    console.log(ques.votes);
    if (check) {
      console.log("new vote");
      ques.upvotes = ques.upvotes - 1;
      ques.votes.push({
        user: user.userid,
        value: -1,
      });
    }
    await ques.save();
    res.json({ question: ques });
  })
);

module.exports = router;
