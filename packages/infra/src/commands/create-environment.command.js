import figlet from 'figlet';
import RailwayService from '../services/railway.service.js';
import delay from '../helpers/delay.js';

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);
/**
 * Creates an Environment
 *
 * @param {string} name - The name of the environment to create
 * @returns {Promise<void>} - A promise that resolves when the environment is created
 */
const createEnvironment = async (name) => {
	console.log(
		figlet.textSync('Create Envitonment', {
			font: 'AMC 3 Line',
		}),
	);
	const environmentName = name.toLowerCase();
	const environments = await railwayClient.getEnvironments();

	const stagingEnv = environments.find(({ name }) => name === 'staging');
	let targetEnv = environments.find(({ name }) => name === environmentName);

	if (!targetEnv) {
		await railwayClient.createEnvironment({
			name: environmentName,
			sourceEnvironmentId: stagingEnv.id,
			ephemeral: false,
		});
		// Delay 30 seconds
		// Railway allows to create an environment every 30 seconds
		await delay(30_000);
		console.log(`Environment "${environmentName}" successfully created`);
	} else {
		console.log('Environment already exist');
	}
};

export default createEnvironment;
