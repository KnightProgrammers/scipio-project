"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const root = async (fastify) => {
    fastify.get('/', async function (_, reply) {
        reply.status(200).send({
            app: 'Scipio',
            version: process.env.npm_package_version,
            environment: process.env.NODE_ENV || 'development'
        });
    });
};
exports.default = root;
