"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    app: {
        port: 8080,
    },
    db: {
        protocol: process.env.MONGO_DB_PROTOCOL || 'mongodb',
        host: process.env.MONGO_DB_HOST || 'localhost',
        port: process.env.MONGO_DB_PORT,
        name: process.env.MONGO_DB_NAME,
        user: process.env.MONGO_DB_USER || 'admin',
        password: process.env.MONGO_DB_PASSWORD || 'password',
        params: '?authSource=admin'
    }
};
