import RailwayService from '../services/railway.service.js';
import delay from './delay.js';
import toTitleCase from './to-title-case.js';

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);

/**
 * Waits for deployment to complete recursively.
 *
 * @param {Object} deployment - The deployment object.
 * @param {string} deployment.id - The ID of the deployment.
 * @param {string} deployment.status - The status of the deployment.
 * @returns {Promise} - A promise that resolves when the deployment is completed.
 */
const waitForDeployRecursive = async (deployment) => {
	const { id, status } = deployment;

	const inProgressStatus = [
		'BUILDING',
		'DEPLOYING',
		'INITIALIZING',
		'QUEUED',
		'REMOVING',
		'WAITING',
	];

	if (inProgressStatus.includes(status)) {
		console.log(`${toTitleCase(status)}...`);
		await delay(10000); // Check every 10seconds
		const deploymentUpdated = await railwayClient.getDeployment(id);
		return waitForDeployRecursive(deploymentUpdated);
	}
};

/**
 * Waits for the deployment of a service in a specific environment to finish.
 *
 * @param {string} serviceName - The name of the service.
 * @param {string} environmentName - The name of the environment.
 * @returns {Promise<void>} - A Promise that resolves when the deployment finishes.
 */
const waitForDeployToFinish = async (serviceName, environmentName) => {
	const environments = await railwayClient.getEnvironments();

	const targetEnv = environments.find(({ name }) => name === environmentName);

	const services = await railwayClient.getServices();
	const service = services.find(({ name }) => name === serviceName);
	const deployment = await railwayClient.getLatestDeployment({
		first: 1,
		serviceId: service.id,
		environmentId: targetEnv.id,
	});
	await waitForDeployRecursive(deployment);
};

export default waitForDeployToFinish;
