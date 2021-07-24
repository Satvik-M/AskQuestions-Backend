const nodemailer = require("nodemailer");

const client = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.sendGrid,
  },
});
const email = (module.exports.authMail = (mail_id, verify) =>
  client.sendMail(
    {
      from: "satvikmakharia@gmail.com",
      to: `${mail_id}`,
      subject: "Please confirm your mail account",
      text: `Please click on the link given below in order to confirm your mail account...${verify}`,
      html: `<b>Please click on the link given below in order to confirm your mail account...</b><a href=${verify} target='_blank'>Verify</a>`,
    },
    function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Message sent: " + info.response);
      }
    }
  ));
