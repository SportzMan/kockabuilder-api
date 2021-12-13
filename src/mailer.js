import nodemailer from "nodemailer";

const from = '"KockaBuilder" <info@kockabuilder.eu>';

function setup() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

export function sendConfirmationEmail(user) {
  const tranport = setup();
  const email = {
    from,
    to: user.email,
    subject: "Üdv a KockaBuilder oldalán",
    text: `
    Üdvözöllek a KockaBuilder oldalán!
    Kérlek erősítsd meg az email címedet:

    ${user.generateConfirmationUrl()}
    `
  };

  tranport.sendMail(email, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  }
  );
}

export function sendResetPasswordEmail(user) {
  const tranport = setup();
  const email = {
    from,
    to: user.email,
    subject: "Új jelszó igénylése",
    text: `
    Új jelszó beállításához kattints az alábbi hivatkozásra:

    ${user.generateResetPasswordLink()}
    `
  };

  tranport.sendMail(email, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  }
  );

}
