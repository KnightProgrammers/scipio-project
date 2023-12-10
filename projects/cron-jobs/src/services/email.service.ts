import mailer from 'nodemailer';

export type SendEmailConf = {
    recipients: string|string[]
    subject: string
    html: string
}

export class EmailService {
	static async sendEmail(conf: SendEmailConf) {

		const transport: any = {
			host: process.env.EMAIL_AUTH_DOMAIN || 'localhost',
			port: process.env.EMAIL_AUTH_PORT,
			auth: {
				user: process.env.EMAIL_AUTH_USER,
				pass: process.env.EMAIL_AUTH_PASS,
			}
		};

		const smtp = mailer.createTransport(transport);
		const mailOptions = {
			from: process.env.EMAIL_SENDER,
			to: conf.recipients,
			subject: conf.subject,
			html: conf.html
		};

		await smtp.sendMail(mailOptions);

		smtp.close();
	}
}
