import pino from 'pino';
import pretty from 'pino-pretty';

const stream = pretty({
	colorize: true,
});

const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error'];

const logLevel: string = (process.env.LOG_LEVEL || '').toLowerCase();

const logger = pino(
	{
		msgPrefix: '',
		base: null,
		level: LOG_LEVELS.includes(logLevel) ? logLevel : 'info',
	},
	stream,
);

export default logger;
