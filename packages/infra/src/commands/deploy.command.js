import figlet from 'figlet';
import { execSync } from 'child_process';
import RailwayService from '../services/railway.service.js';
import waitForDeployToFinish from '../helpers/wait-for-deploy.js';

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);

/**
 * Deploys a service to the specified environment.
 *
 * @param {Object} options - The options for deploying the service.
 * @param {string} options.service - The name of the service to deploy.
 * @param {string} options.environment - The name of the environment to deploy to.
 *
 * @throws {Error} If the specified environment is not found.
 * @throws {Error} If the Railway command fails.
 *
 * @returns {Promise<void>} A promise that resolves when the deployment is complete.
 */
const deployCommand = async (options) => {
	console.log(
		figlet.textSync(`Deploy ${options.service}`, {
			font: 'AMC 3 Line',
		}),
	);
	const serviceName = `scipio-${options.service}`;
	const environmentName = options.environment.toLowerCase();
	const environments = await railwayClient.getEnvironments();

	const targetEnv = environments.find(({ name }) => name === environmentName);

	if (!targetEnv) {
		throw new Error(`Environment "${environmentName}" not found`);
	}
	const environmentTokenName = `CI Deploy - ${options.service} - ${environmentName}`;

	const projectAuthToken = await railwayClient.createEnvironmentToken({
		name: environmentTokenName,
		environmentId: targetEnv.id,
	});

	try {
		execSync(
			`RAILWAY_TOKEN=${projectAuthToken} railway up -s ${serviceName} -e ${environmentName}  -d`,
		).toString('utf8');
	} catch {
		throw new Error('Railway command failed');
	} finally {
		const environmentTokens = await railwayClient.getEnvironmentTokens();
		const tokenFound = environmentTokens.find(
			({ environmentId, name }) =>
				name === environmentTokenName && environmentId === targetEnv.id,
		);
		await railwayClient.deleteEnvironmentToken(tokenFound.id);
	}
	await waitForDeployToFinish(serviceName, environmentName);
	console.log(
		`Service ${serviceName} successfully deployed into ${environmentName}`,
	);
};

export default deployCommand;
