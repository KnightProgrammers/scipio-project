import clear from 'clear'
import chalk from 'chalk'
import figlet from 'figlet';

import { Command, Option } from 'commander';
const program = new Command();

import deployCommand from './commands/deploy.command.js';
import deleteEnvironmentCommand from './commands/delete-environment.command.js';

clear()

console.log(
    chalk.yellow.bold(
        figlet.textSync('Scipio Deploy', {
            horizontalLayout: 'full'
        })
    )
)

console.log('\n\n')

const version = process.env.npm_package_version;

program
    .name('scipio-infra')
    .description('CLI deploy Scipio application on Railway')
    .version(version);

const servicesOption = new Option('-s, --service <service-name>').choices(['small', 'medium', 'large']);
servicesOption.optional = false;
servicesOption.required = true;

program.command('deploy')
    .description('Deploy a service into the selected environment')
    .requiredOption('-e, --environment <name>', 'Name of the environment to be deployed', 'staging')
    .addOption(servicesOption)
    .action(deployCommand)


program.command('delete-environment')
    .description(`'Delete branch environment after it's merged`)
    .argument('<environment-name>', 'Name of the environment to delete')
    .action(deleteEnvironmentCommand);

program.parse();
