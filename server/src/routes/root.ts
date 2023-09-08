import { FastifyPluginAsync } from 'fastify'
import User from '../models/user.model';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const u = await User.create({
      name: 'Javier',
      email: 'javier@test.com',
      firebaseId: 'test'
    })
    return { u }
  })
}

export default root;
