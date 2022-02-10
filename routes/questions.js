const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Answer = require("../models/answers");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { questionSchema, answerSchema } = require("../schemas");
const {
  validateAnswer,
  validateQuestion,
  isLoggedIn,
  isQuestionAuthor,
} = require("../middleware");
const question = require("../models/question");

router.get(
  "/new",
  // isLoggedIn,
  (req, res) => {
    res.render("questions/home");
  }
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const question = await Question.findById(req.params.id);
    res.json(question);
  })
);

router.get(
  "/",
  catchAsync(async (req, res) => {
    const questions = await Question.find().sort({ upvotes: -1 });
    // res.render("questions/list", { questions });
    res.json(questions);
  })
);
// router.post("/", isLoggedIn, validateQuestion, async (req, res) => {
router.post("/", validateQuestion, async (req, res) => {
  const ques = new Question({
    title: req.body.title,
    description: req.body.description,
    upvotes: 0,
    votes: [],
  });
  ques.author = req.user;
  question.author = null;
  await ques.save();
  req.flash("success", "Question has been posted successfully");
  res.redirect("/questions");
});
router.get(
  "/:id/edit",
  isLoggedIn,
  isQuestionAuthor,
  catchAsync(async (req, res) => {
    const values = await Question.findById(req.params.id).populate({
      path: "answers",
      options: { sort: { upvotes: -1 } },
    });
    if (!values) {
      req.flash("error", "Question not found");
      res.redirect("/questions");
    }
    res.render("questions/edit", { values });
  })
);
router.put(
  "/:id",
  isLoggedIn,
  isQuestionAuthor,
  validateQuestion,
  catchAsync(async (req, res) => {
    // console.log(req.body);
    const ques = await Question.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
    });
    if (!ques) {
      req.flash("error", "Question not found");
      res.redirect("/questions");
    }
    req.flash("success", "Modified the question successfully");
    res.redirect("/questions");
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isQuestionAuthor,
  catchAsync(async (req, res) => {
    const ques = await Question.findById(req.params.id).populate("answers");
    if (!ques) {
      req.flash("error", "Question not found");
      res.redirect("/questions");
    }
    for (q of ques.answers) {
      // console.log(q._id);
      await Answer.findByIdAndDelete(q._id);
    }
    await Question.findByIdAndDelete(req.params.id);
    req.flash("success", "Question has been deleted successfully");
    res.redirect("/questions");
  })
);

module.exports = router;
