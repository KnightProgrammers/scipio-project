import 'module-alias/register';
import { join } from 'path';
import AutoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import * as Sentry from '@sentry/node';
import * as FastifySentry from '@immobiliarelabs/fastify-sentry';
import { ProfilingIntegration } from '@sentry/profiling-node';
import mongoose from 'mongoose';
import mercurius from 'mercurius';
import mercuriusAuth from 'mercurius-auth';
import { config } from './config';
import schema from './graphql/schema';
import resolvers from './graphql/resolvers';
import { authenticateUser } from '@/middlewares/auth.middleware';

const options: any = {
	logger: {
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'mm/dd/yyyy HH:MM:ss',
				ignore: 'pid,hostname,reqId',
			},
		},
	},
};

const app: any = async (fastify: any, opts: any): Promise<void> => {
	fastify.log.info(config.db.uri);

	if(['staging'].includes(config.app.environment)){
		fastify.register(FastifySentry, {
			dsn: process.env.SENTRY_DSN,
			environment: config.app.environment,
			integrations: [
				new ProfilingIntegration(),
				new Sentry.Integrations.GraphQL()
			],
			// Performance Monitoring
			tracesSampleRate: 1.0,
			// Set sampling rate for profiling - this is relative to tracesSampleRate
			profilesSampleRate: 1.0,
		});
	}

	mongoose
		.connect(config.db.uri)
		.then(() => fastify.log.info('MongoDB connected...'))
		.catch((err) => fastify.log.error(err));

	await fastify.register(cors, () => (req: any, callback: any) => {
		const corsOptions = {
			// This is NOT recommended for production as it enables reflection exploits
			origin: true,
		};

		// do not include CORS headers for requests from localhost
		if (/^localhost$/m.test(req.headers.origin)) {
			corsOptions.origin = false;
		}

		// callback expects two parameters: error and options
		callback(null, corsOptions);
	});

	fastify.register(mercurius, {
		schema,
		resolvers,
		graphiql: true
	});

	fastify.register(AutoLoad, {
		dir: join(__dirname, 'routes'),
		options: opts,
	});

	fastify.register(mercuriusAuth, {
		async authContext (context: any) {
			return authenticateUser(context.reply.request.headers['authorization']);
		},
		async applyPolicy (uthDirectiveAST: any, parent: any, args: any, context: any) {
			if (!context.auth._id) {
				const err = new mercurius.ErrorWithProps('No authenticated');
				err.statusCode = 401;
				throw err;
			}
			return true;
		},
		authDirective: 'auth'
	});
};

export default app;
export { app, options };