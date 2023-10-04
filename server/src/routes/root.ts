const root: any = async (fastify: any): Promise<void> => {
	fastify.get('/', async function (_: any, reply: any) {
		reply.status(200).send({
			app: 'Scipio',
			version: process.env.npm_package_version,
			environment: process.env.NODE_ENV || 'development',
		});
	});
};

export default root;
