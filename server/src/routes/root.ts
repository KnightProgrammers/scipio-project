import { config } from '../config';

const root: any = async (fastify: any): Promise<void> => {
	fastify.get('/', async function (_: any, reply: any) {
		reply.status(200).send({
			app: 'Scipio',
			version: config.app.version,
			environment: config.app.environment
		});
	});
};

export default root;
