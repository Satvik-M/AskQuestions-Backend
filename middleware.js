const { questionSchema, answerSchema, userSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Question = require("./models/question");
const Answer = require("./models/answers");

module.exports.validateQuestion = (req, res, next) => {
  const { error } = questionSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(msg, 400);
  } else next();
};
module.exports.validateAnswer = (req, res, next) => {
  const { error } = answerSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(msg, 400);
  } else next();
};

module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(msg, 400);
  } else next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isVerified) {
    return next();
  }
  if (req.user && !req.user.isVerified) {
    req.flash("error", "Please verify for email first.");
    return res.redirect("/questions");
  }
  req.flash("error", "Please login to continue");
  res.redirect("/users/login");
};

module.exports.isQuestionAuthor = async (req, res, next) => {
  const ques = await Question.findById(req.params.id);
  if (ques.author.equals(req.user._id)) return next();
  else {
    req.flash("error", "You are not allowed to do this operation");
    res.redirect(`/questions`);
  }
};

module.exports.isAnswerAuthor = async (req, res, next) => {
  const ans = await Answer.findById(req.params.a_id);
  if (ans.author.equals(req.user._id)) return next();
  else {
    req.flash("error", "You are not allowed to do this operation");
    return res.redirect(`/questions`);
  }
};
