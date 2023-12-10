import mailer from 'nodemailer';

export type SendEmailConf = {
    recipients: string|string[]
    subject: string
    html: string
}

export class EmailService {
	static async sendEmail(conf: SendEmailConf) {
		const smtp = mailer.createTransport({
			host: 'localhost',
			port: 1025,
			auth: {
				user: 'user',
				pass: 'password'
			}
		});
		const mailOptions = {
			from: 'noreply@scipio.com',
			to: conf.recipients,
			subject: conf.subject,
			html: conf.html
		};

		await smtp.sendMail(mailOptions);

		smtp.close();
	}
}
