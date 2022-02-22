const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.sendGrid);

const templateId = {
  confirmEmail: "d-d0e7c98d43aa4ebaaf13efba5288683f",
  resetPassword: "d-67943bd6b17541339fd44bbc64cdbc63",
};

module.exports.authMail = (mail_id, verify) => {
  const msg = {
    from: "satvikmakharia@gmail.com",
    to: `${mail_id}`,
    templateId: templateId.confirmEmail,
    dynamic_template_data: {
      link: verify,
    },
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email send!");
      console.log(msg);
    })
    .catch((error) => {
      console.error(error);
    });
};
