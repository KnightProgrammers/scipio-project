import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import { config } from "./config";



export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'mm/dd/yyyy HH:MM:ss',
        ignore: 'pid,hostname,reqId',
      },
    },
  }
}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  // Place here your custom code!
  mongoose
    .connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}?authSource=admin`, {
      user: config.db.user,
      pass: config.db.password,
      autoCreate: true,
    })
    .then(() => fastify.log.info('MongoDB connected...'))
    .catch(err => fastify.log.error(err));

  await fastify.register(cors, {
    // put your options here
  })

  fastify.withTypeProvider<TypeBoxTypeProvider>()

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })

};

export default app;
export { app, options }
