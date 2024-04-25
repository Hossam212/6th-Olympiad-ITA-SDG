const pug = require('pug');
const htmlToText = require('html-to-text');
const mailer = require('nodemailer');
const postmarkTransport = require('nodemailer-postmark-transport');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Hossam Ahmed <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    //Postmark
    if (process.env.NODE_ENV === 'production') {
      return mailer.createTransport(
        postmarkTransport({
          auth: {
            apiKey: process.env.POSTMARK_APIKEY,
          },
        })
      );
    }
  }
  // Send the actual email
  async send(template, subject) {
    const html = pug.renderFile(`../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const options = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      // html:
    };
    await this.newTransport().sendMail(options);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async resetPassword() {
    await this.send(
      'resetPassword',
      'Reset password link (Valid for only 10 minutes)'
    );
  }
};
