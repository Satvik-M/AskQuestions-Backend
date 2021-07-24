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

router.get(
  "/answers/:a_id/upvote",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const ans = await Answer.findById(req.params.a_id);
    let check = true;
    for (vote of ans.votes) {
      console.log(vote);
      if (vote.user.equals(req.user._id)) {
        check = false;
        if (vote.value == -1) {
          ans.upvotes += 2;
          vote.value = 1;
          vote.save();
          ans.save();
        }
      }
    }
    console.log(ans.votes);
    if (check) {
      ans.upvotes = ans.upvotes + 1;
      ans.votes.push({
        user: req.user._id,
        value: 1,
      });
      ans.save();
      return res.redirect(`/questions/${req.params.id}/answers`);
    } else {
      return res.redirect(`/questions/${req.params.id}/answers`);
    }
  })
);
router.get(
  "/answers/:a_id/downvote",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const ans = await Answer.findById(req.params.a_id);
    let check = true;
    for (vote of ans.votes) {
      console.log(vote);
      if (vote.user.equals(req.user._id)) {
        console.log(vote.user.equals(req.user._id));
        check = false;
        if (vote.value == 1) {
          ans.upvotes -= 2;
          vote.value = -1;
          vote.save();
          ans.save();
        }
      }
    }
    console.log(ans.votes);
    if (check) {
      ans.upvotes = ans.upvotes - 1;
      ans.votes.push({
        user: req.user._id,
        value: -1,
      });
      ans.save();
      return res.redirect(`/questions/${req.params.id}/answers`);
    } else {
      return res.redirect(`/questions/${req.params.id}/answers`);
    }
  })
);
router.get(
  "/upvote",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const ques = await Question.findById(req.params.id);
    let check = true;
    for (vote of ques.votes) {
      console.log(vote);
      if (vote.user.equals(req.user._id)) {
        check = false;
        if (vote.value == -1) {
          ques.upvotes += 2;
          vote.value = 1;
          vote.save();
          ques.save();
        }
      }
    }
    console.log(ques.votes);
    if (check) {
      ques.upvotes = ques.upvotes + 1;
      ques.votes.push({
        user: req.user._id,
        value: 1,
      });
      ques.save();
      return res.redirect(`/questions/${req.params.id}/answers`);
    } else {
      return res.redirect(`/questions/${req.params.id}/answers`);
    }
  })
);
router.get(
  "/downvote",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const ques = await Question.findById(req.params.id);
    let check = true;
    for (vote of ques.votes) {
      console.log(vote);
      if (vote.user.equals(req.user._id)) {
        check = false;
        if (vote.value == 1) {
          ques.upvotes -= 2;
          vote.value = -1;
          vote.save();
          ques.save();
        }
      }
    }
    console.log(ques.votes);
    if (check) {
      ques.upvotes = ques.upvotes - 1;
      ques.votes.push({
        user: req.user._id,
        value: -1,
      });
      ques.save();
      return res.redirect(`/questions/${req.params.id}/answers`);
    } else {
      return res.redirect(`/questions/${req.params.id}/answers`);
    }
  })
);

module.exports = router;
