"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.app = void 0;
require("module-alias/register");
const path_1 = require("path");
const autoload_1 = require("@fastify/autoload");
const cors_1 = require("@fastify/cors");
const mongoose_1 = require("mongoose");
const config_1 = require("./config");
const options = {
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'mm/dd/yyyy HH:MM:ss',
                ignore: 'pid,hostname,reqId',
            },
        },
    }
};
exports.options = options;
const app = async (fastify, opts) => {
    mongoose_1.default
        .connect(`${config_1.config.db.protocol}://${config_1.config.db.host}${config_1.config.db.port ? `:${config_1.config.db.port}` : ''}/${!!config_1.config.db.name && config_1.config.db.name}${!!config_1.config.db.params && config_1.config.db.params}`, {
        user: config_1.config.db.user,
        pass: config_1.config.db.password,
        autoCreate: true,
    })
        .then(() => fastify.log.info('MongoDB connected...'))
        .catch(err => fastify.log.error(err));
    await fastify.register(cors_1.default, {});
    void fastify.register(autoload_1.default, {
        dir: (0, path_1.join)(__dirname, 'plugins'),
        options: opts
    });
    void fastify.register(autoload_1.default, {
        dir: (0, path_1.join)(__dirname, 'routes'),
        options: opts
    });
};
exports.app = app;
exports.default = app;
