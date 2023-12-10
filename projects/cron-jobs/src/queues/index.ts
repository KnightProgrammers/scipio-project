import Redis from 'ioredis';
import { emailWorker } from './workers/email.worker';

const connection = new Redis('redis://default:password@localhost:6379', {
	maxRetriesPerRequest: null
});

export class Queues {
	static async init() {
		try {
			await emailWorker(connection).run();
		} catch (e) {
			console.log('Error to start Email Queue');
			console.error(e);
		}
	}
}
