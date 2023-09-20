const RailwayService = require('./services/railway.service');

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);

const delay = (t, val) => new Promise(resolve => setTimeout(resolve, t, val));


function toTitleCase(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();
 
    return str.replace(/\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() +
                txt.substr(1).toLowerCase();
        });
}

const waitForDeploymentToFinish = async (serviceName, deployment) => {
    const {id, status} = deployment;
    const finished = ![
        'BUILDING',
        'DEPLOYING',
        'INITIALIZING',
        'QUEUED',
        'REMOVING',
        'WAITING'
    ].includes(status);

    if (finished) {
        console.log(deployment);
    } else {
        console.log(`${serviceName}: ${toTitleCase(status)}...`)
        await delay(30000);
        const deploymentUpdated = await railwayClient.getDeployment(id);
        return waitForDeploymentToFinish(serviceName, deploymentUpdated);
    }
}

const main = async () => {
    const environments = await railwayClient.getEnvironments();
    console.log({environments})

    const testEnv = environments.find(({name}) => name === 'test');

    const services = await railwayClient.getServices();
    console.log(services)
    await Promise.all(services.map(async (service) => {
        const deployment = await railwayClient.getLatestDeployment({
            first: 1,
            serviceId: service.id,
            environmentId: testEnv.id
        });
        await waitForDeploymentToFinish(service.name, deployment);
    }));
}

main().catch(console.error)