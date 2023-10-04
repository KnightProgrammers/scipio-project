import figlet from 'figlet';
import { execSync } from 'child_process';
import RailwayService from '../services/railway.service.js';
import waitForDeployToFinish from '../helpers/wait-for-deploy.js';

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);

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
