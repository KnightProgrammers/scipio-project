import figlet from 'figlet';
import RailwayService from '../services/railway.service.js';

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);

/**
 * Deletes an environment.
 *
 * @async
 * @function deleteEnvironmentCommand
 * @param {string} environmentName - The name of the environment to delete.
 * @returns {Promise<void>} - A promise that resolves when the environment is deleted.
 */
const deleteEnvironmentCommand = async (environmentName) => {
	console.log(
		figlet.textSync('Delete Envitonment', {
			font: 'AMC 3 Line',
		}),
	);
	const environments = await railwayClient.getEnvironments();
	const environment = environments.find(
		({ name }) => name === environmentName,
	);
	if (!environment) {
		console.log('Environment already deleted.');
		return;
	}
	await railwayClient.deleteEnvironment(environment.id);
	console.log(`Environment "${environmentName}" deleted.`);
};

export default deleteEnvironmentCommand;
