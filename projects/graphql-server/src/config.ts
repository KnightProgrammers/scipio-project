export const config = {
	app: {
		port: 8080,
		environment: process.env.NODE_ENV || 'development',
		version: process.env.npm_package_version,
		webUrl: process.env.WEB_URL
	},
	db: {
		uri: process.env.MONGO_DB_URI || ''
	},
	redis: {
		uri: process.env.REDIS_URI || ''
	}
};
