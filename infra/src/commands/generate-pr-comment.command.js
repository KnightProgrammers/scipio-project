import figlet from 'figlet';
import fs from 'fs';
import toTitleCase from '../helpers/to-title-case.js';
import RailwayService from '../services/railway.service.js';

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);

const generatePrCommentCommand = async (options) => {
	console.log(
		figlet.textSync('Generate PR Comment', {
			font: 'AMC 3 Line',
		}),
	);

	let content = '## Deploy Status';

	// Add link to dashboard
	const projectId = process.env.RAILWAY_PROJECT_ID;
	content += `\n> Railway Dashboard: [link](https://railway.app/project/${projectId})`;
	const environmentName = options.environment.toLowerCase();
	const environments = await railwayClient.getEnvironments();

	const environment = environments.find(
		({ name }) => name === environmentName,
	);

	if (!environment) {
		throw new Error(`Environment "${environmentName}" not found`);
	}

	const services = await railwayClient.getServices();

	let hadJobFailed = false;

	for (const service of services) {
		const deployment = await railwayClient.getLatestDeployment({
			first: 1,
			serviceId: service.id,
			environmentId: environment.id,
		});

		content += '\n\n';
		content += `### ${toTitleCase(service.name.split('scipio-')[1])}`;
		content += '\n';

		const DEPLOY_STATUS_LABEL = {
			CRASHED: 'Crashed ❌',
			FAILED: 'Failed ❌',
			REMOVED: 'Removed 🗑️',
			SKIPPED: 'Skipped 🧸',
			SUCCESS: 'Success ✅',
		};

		if (['CRASHED', 'FAILED'].includes(deployment.status)) {
			hadJobFailed = true;
		}

		content += ` - **Status:** ${DEPLOY_STATUS_LABEL[deployment.status]} `;
		content += '\n';
		content += ` - **Url:** [${service.name}-${environmentName}.up.railway.app 🔗]`;
		content += `(https://${service.name}-${environmentName}.up.railway.app)`;
	}

	fs.writeFileSync('./pr-comment.md', content);

	if (hadJobFailed) {
		throw new Error('Deploy failed');
	}
};

export default generatePrCommentCommand;
