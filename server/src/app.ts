import 'module-alias/register';
import { join } from 'path';
import AutoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import mercurius from 'mercurius';
import mercuriusAuth from 'mercurius-auth';
import { config } from './config';
import schema from './graphql/schema';
import resolvers from './graphql/resolvers';
import * as console from 'console';
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
	fastify.log.info(
		`${config.db.protocol}://${config.db.host}${
			config.db.port ? `:${config.db.port}` : ''
		}/${!!config.db.name && config.db.name}${
			!!config.db.params && config.db.params
		}`,
	);

	mongoose
		.connect(
			`${config.db.protocol}://${config.db.host}${
				config.db.port ? `:${config.db.port}` : ''
			}/${!!config.db.name && config.db.name}${
				!!config.db.params && config.db.params
			}`,
			{
				user: config.db.user,
				pass: config.db.password,
				autoCreate: true,
			},
		)
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
			return (await authenticateUser(context.reply.request.headers['authorization'])).toObject();
		},
		async applyPolicy (uthDirectiveAST: any, parent: any, args: any, context: any) {
			console.log(context.auth);
			if (!context.auth._id) {
				throw new Error('No authenticated');
			}
			return true;
		},
		authDirective: 'auth'
	});
};

export default app;
export { app, options };
