const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { questionSchema, answerSchema } = require("../schemas");
const Question = require("../models/question");
const Answer = require("../models/answers");
const {
  validateAnswer,
  validateQuestion,
  isLoggedIn,
  isAnswerAuthor,
} = require("../middleware");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const values = await Question.findById(req.params.id).populate({
      path: "answers",
      options: { sort: { upvotes: -1 } },
    });
    // console.log(values);
    // if (!values) {
    //   req.flash("error", "Question not found");
    //   res.redirect("/questions");
    // }
    // res.render("answers/list", { values });
    res.json(values);
  })
);

router.get(
  "/:a_id/edit",
  isLoggedIn,
  isAnswerAuthor,
  catchAsync(async (req, res) => {
    const values = await Question.findById(req.params.id).populate({
      path: "answers",
      options: { sort: { upvotes: -1 } },
    });
    const answer = await Answer.findById(req.params.a_id).populate("question");
    if (!ans) {
      req.flash("error", "Answer not found");
      return res.redirect(`/questions/${req.params.id}/answers`);
    }
    return res.render("answers/edit", { answer, values });
  })
);

router.get(
  "/new",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const ques = await Question.findById(req.params.id);
    if (!ques) {
      req.flash("error", "Question not found");
      res.redirect("/questions");
    }
    res.render("answers/new", { ques });
  })
);

router.post(
  "/",
  // isLoggedIn,
  catchAsync(async (req, res) => {
    const ques = await Question.findById(req.params.id);
    // if (!ques) req.flash("error", "Question not found");
    if (!ques) res.status(400).json({ message: "Question not found" });
    const ans = new Answer({
      question: ques._id,
      answer: req.body.answer,
      author: req.body.author,
      upvotes: 0,
      votes: [],
    });
    // console.log(ans);
    ques.answers.push(ans._id);
    const savedAns = await ans.save();
    await ques.save();
    // console.log(ques);
    // req.flash("success", "Asnwer saved successfully");
    // res.redirect(`/questions/${req.params.id}/answers`);
    res.json(savedAns);
  })
);

router.delete(
  "/:a_id",
  isLoggedIn,
  isAnswerAuthor,
  catchAsync(async (req, res) => {
    const { id, a_id } = req.params;
    await Question.findByIdAndUpdate(id, {
      $pull: {
        answers: a_id,
      },
    });
    await Answer.findByIdAndDelete(a_id);
    req.flash("success", "Deleted the answer successfully");
    res.redirect(`/questions/${id}/answers`);
  })
);

router.put(
  "/:a_id",
  // isLoggedIn,
  // isAnswerAuthor,
  catchAsync(async (req, res) => {
    const { id, a_id } = req.params;
    const ans = await Answer.findByIdAndUpdate(req.params.a_id, {
      answer: req.body.answer.answer,
    });
    req.flash("success", "Modified answer successfully");
    res.json({ answer: ans });
    // res.redirect(`/questions/${id}/answers`);
  })
);

module.exports = router;
