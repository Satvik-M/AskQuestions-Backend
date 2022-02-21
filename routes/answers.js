const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Question = require("../models/question");
const Answer = require("../models/answers");
const { validateAnswer, isLoggedIn, isAnswerAuthor } = require("../middleware");

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

router.post(
  "/",
  isLoggedIn,
  validateAnswer,
  catchAsync(async (req, res) => {
    const ques = await Question.findById(req.params.id);
    // if (!ques) req.flash("error", "Question not found");
    if (!ques) res.status(400).json({ message: "Question not found" });
    const ans = new Answer({
      question: ques._id,
      answer: req.body.answer,
      author: req.user._id,
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
    console.log("delete");
    const { id, a_id } = req.params;
    await Question.findByIdAndUpdate(id, {
      $pull: {
        answers: a_id,
      },
    });
    await Answer.findByIdAndDelete(a_id);
    res.json({ message: "Success" });
  })
);

router.put(
  "/:a_id",
  isLoggedIn,
  isAnswerAuthor,
  validateAnswer,
  catchAsync(async (req, res) => {
    const { id, a_id } = req.params;
    const ans = await Answer.findByIdAndUpdate(req.params.a_id, {
      answer: req.body.answer,
    });
    res.json({ answer: ans });
    // res.redirect(`/questions/${id}/answers`);
  })
);

module.exports = router;
