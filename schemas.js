const Joi = require("joi");

module.exports.questionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
}).required();

module.exports.answerSchema = Joi.object({
  answer: Joi.string().required(),
}).required();

module.exports.userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    // .regex(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
    .required(),
}).required();
