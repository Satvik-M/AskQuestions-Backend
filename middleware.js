const { questionSchema, answerSchema, userSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Question = require("./models/question");
const Answer = require("./models/answers");
const jwt = require("jsonwebtoken");
const User = require("./models/users");

module.exports.isLoggedIn = (req, res, next) => {
  const token = req.query.token;
  jwt.verify(token, "secret", async (err, decoded) => {
    if (!err) {
      console.log(decoded);
      const user = await User.findById(decoded.userid);
      // if (user && user.isVerified) {
      if (user) {
        req.user = user;
        return next();
      } else if (user && !user.isVerified) {
        req.user = user;
        return res.status(400).json({ message: "Account not verified" });
      }
      if (!user) return res.status(400).json({ message: "User Error" });
      return next();
    } else {
      console.log(err);
      return res.status(400).json({ message: "User Error" });
    }
  });
};

module.exports.isQuestionAuthor = async (req, res, next) => {
  const ques = await Question.findById(req.params.id);
  if (!ques) return res.status(500).json({ message: "No question Found" });
  if (req.user._id.toString() === ques.author.toString()) {
    req.ques = ques;
    return next();
  } else {
    return res.status(403).json({ message: "Not Question Author" });
  }
};

module.exports.isAnswerAuthor = async (req, res, next) => {
  const ans = await Answer.findById(req.params.a_id);
  if (!ans) return res.status(500).json({ message: "No Answer Found" });
  if (req.user._id.toString() === ans.author.toString()) {
    req.ans = ans;
    return next();
  } else {
    return res.status(403).json({ message: "Not Answer Author" });
  }
};

module.exports.validateQuestion = (req, res, next) => {
  const { error } = questionSchema.validate(req.body);
  if (error) {
    // const msg = error.details.map((e) => e.message).join(",");
    // throw new ExpressError(msg, 400);
    res.status(400).json({ message: "verification failed", error });
  } else next();
};
module.exports.validateAnswer = (req, res, next) => {
  const { error } = answerSchema.validate(req.body);
  if (error) {
    // const msg = error.details.map((e) => e.message).join(",");
    // throw new ExpressError(msg, 400);
    res.status(400).json({ message: "verification failed", error });
  } else next();
};

module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(msg, 400);
  } else next();
};
