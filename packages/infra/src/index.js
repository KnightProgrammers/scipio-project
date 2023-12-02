#!/usr/bin/env node

import clear from 'clear';
import chalk from 'chalk';
import figlet from 'figlet';

import { Command, Option } from 'commander';

import deployCommand from './commands/deploy.command.js';
import deleteEnvironmentCommand from './commands/delete-environment.command.js';
import createEnvironmentCommand from './commands/create-environment.command.js';
import generatePrCommentCommand from './commands/generate-pr-comment.command.js';

const program = new Command();

clear();

console.log(
	chalk.yellow.bold(
		figlet.textSync('Scipio Deploy', {
			font: 'ANSI Shadow',
			horizontalLayout: 'full',
		}),
	),
);

console.log('\n\n');

const version = process.env.npm_package_version;

program
	.name('scipio-infra')
	.description('CLI deploy Scipio application on Railway')
	.version(version);

program
	.command('deploy')
	.description('Deploy a service into the selected environment')
	.requiredOption(
		'-e, --environment <name>',
		'Name of the environment to be deployed',
		'staging',
	)
	.addOption(
		new Option('-s, --service <service-name>')
			.choices(['client', 'server'])
			.makeOptionMandatory(true),
	)
	.action(deployCommand);

program
	.command('environment-create')
	.description('Create a branch environment')
	.argument('<environment-name>', 'Name of the environment to created')
	.action(createEnvironmentCommand);

program
	.command('environment-delete')
	.description('Delete branch environment after it\'s merged')
	.argument('<environment-name>', 'Name of the environment to delete')
	.action(deleteEnvironmentCommand);

program
	.command('generate-pr-comment')
	.description(
		'Generates a Pull Request comment base on the latest deployment status of an environment',
	)
	.requiredOption(
		'-e, --environment <name>',
		'Name of the environment to be deployed',
	)
	.action(generatePrCommentCommand);

program.parse();
