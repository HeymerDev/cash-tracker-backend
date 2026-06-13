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
                <a href="${process.env.FRONTEND_URL}/auth/verify-email">Visit the following link to copy the token</a>
                <h2>${user.token}</h2>
          `,
    });
  }

  static async sendForgotPasswordEmail(user: User) {
    const email = await transporter.sendMail({
      from: "Cash Tracker <heymermeza11@gmail.com>",
      to: user.email,
      subject: "Reset your password",
      html: `
              <h1>Welcome to Cash Tracker, ${user.name}!</h1>
                <p>Please use the following token to reset your password:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Visit the following link to copy the token</a>
                <h2>${user.token}</h2>
          `,
    });
  }
}
