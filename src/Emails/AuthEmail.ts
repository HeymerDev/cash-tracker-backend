import { transporter } from "../config/nodemailer";

type User = {
  email: string;
  name: string;
  token: string;
};

export class AuthEmail {
  static async sendVerificationEmail(user: User) {
    const email = await transporter.sendMail({
      from: "Cash Tracker <heymermeza11@gmail.com>",
      to: user.email,
      subject: "Verify your email",
      html: `
              <h1>Welcome to Cash Tracker, ${user.name}!</h1>
                <p>Please use the following token to verify your email:</p>
                <h2>${user.token}</h2>
                <p>This token will expire in 10 minutes.</p>
          `,
    });

    console.log("Verification email sent: %s", email.messageId);
  }
}
