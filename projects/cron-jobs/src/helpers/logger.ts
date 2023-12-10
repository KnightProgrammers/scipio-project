import pino from 'pino';
import pretty from 'pino-pretty';

const stream = pretty({
	colorize: true,
});

const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error'];

const logLevel: string = (process.env.LOG_LEVEL || '').toLowerCase();

export default function getLogger(msgPrefix = '') {
	return pino(
		{
			msgPrefix,
			base: null,
			level: LOG_LEVELS.includes(logLevel) ? logLevel : 'debug',
		},
		stream
	);
}
