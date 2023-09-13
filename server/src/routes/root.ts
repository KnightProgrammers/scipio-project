import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    reply.status(200).send({
      app: 'Scipio',
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV || 'development'
    });
  })
}

export default root;
