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
    res.json(questions);
  })
);

router.post("/", isLoggedIn, validateQuestion, async (req, res) => {
  const ques = new Question({
    title: req.body.title,
    description: req.body.description,
    upvotes: 0,
    votes: [],
  });
  ques.author = req.user;
  const savedQuestion = await ques.save();
  res.json({ message: "Success", question: savedQuestion });
});

router.put(
  "/:id",
  isLoggedIn,
  isQuestionAuthor,
  validateQuestion,
  catchAsync(async (req, res) => {
    const ques = await Question.findByIdAndUpdate(req.params.id, {
      description: req.body.question.description,
    });
    res.json({ question: ques });
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isQuestionAuthor,
  catchAsync(async (req, res) => {
    for (q of req.ques.answers) {
      await Answer.findByIdAndDelete(q._id);
    }
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Success" });
  })
);

module.exports = router;
