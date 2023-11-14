import NodeMailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { env } from '~/env.mjs';

export class Mailer {
  private static instance: Mailer;
  private transporter!: NodeMailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    if (!Mailer.instance) {
      this.transporter = NodeMailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.NODEMAILER_EMAIL,
          pass: env.NODEMAILER_PW,
        },
      });

      Mailer.instance = this;
    }

    return Mailer.instance;
  }

  async sendEmail(data: { to: string; subject: string; text: string; html: string }) {
    const { to, subject, text, html } = data;

    await this.transporter.sendMail({
      from: `"Sacc Grupo 7" <${env.NODEMAILER_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
  }
}
