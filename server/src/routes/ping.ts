import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/ping', async function (request, reply) {
    reply.status(204).send();
  })
}

export default root;
