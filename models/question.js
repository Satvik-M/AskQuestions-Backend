const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  answers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  votes: [
    {
      user: {
        type: String,
        // ref: "User",
      },
      value: Number,
    },
  ],
  upvotes: Number,
});

module.exports = mongoose.model("Question", QuestionSchema);
