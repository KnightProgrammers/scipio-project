const root: any = async (fastify: any): Promise<void> => {
	fastify.get('/ping', async function (_: any, reply: any) {
		reply.status(204).send();
	});
};

export default root;
