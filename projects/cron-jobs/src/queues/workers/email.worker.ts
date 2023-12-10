import { Job, Queue, Worker } from 'bullmq';
import type {ConnectionOptions} from 'bullmq';
import { EmailService } from '../../services/email.service';
import fs from 'fs';

const QUEUE_NAME = 'Emails';

const EMAIL_TEMPLATES = [
	'welcome-email',
	'reset-password-email',
];

export const emailWorker = (connection: ConnectionOptions) => {
	new Queue(
		QUEUE_NAME,
		{
			connection,
			defaultJobOptions: {
				removeOnComplete: true,
				attempts: 10,
				removeOnFail: false,
				backoff: {
					type: 'exponential',
					delay: 1000
				}
			}
		}
	);
	const worker = new Worker(QUEUE_NAME, async (job: Job)=>{
		const  {
			recipients,
			subject,
			fields
		} = job.data;
		const templateName:string = job.name;
		if (!EMAIL_TEMPLATES.includes(templateName)) {
			throw new Error(`Template "${templateName}" not supported`);
		}

		let data: string = fs.readFileSync(`./fixtures/email-templates/${templateName}.html`).toString();

		Object.keys(fields).forEach((field: string) => {
			data = data.replace(`{${field}}`, fields[field]);
		});
		console.log(`Sending Email <${templateName}>`);
		await EmailService.sendEmail({
			recipients,
			subject,
			html: data
		});
		await job.updateProgress(100);
	}, {
		connection,
		autorun: false,
	});

	worker.on('completed', () => {
		console.log('Email sent!');
	});

	worker.on('failed', async (job: Job|undefined, err: Error) => {
		console.log(`Failed to send email <${err.message}>`);
		console.log(JSON.stringify(job?.data, null, 2));
	});
	return worker;
};
