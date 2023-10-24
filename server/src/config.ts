export const config = {
	app: {
		port: 8080,
		environment: process.env.NODE_ENV || 'development',
		version: process.env.npm_package_version,
	},
	db: {
		uri: process.env.MONGO_DB_URI
	},
};
