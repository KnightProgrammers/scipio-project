const RailwayService = require('./services/railway.service');

const main = async () => {
    const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);
    const environments = await railwayClient.getEnvironments();
    console.log({environments})

    const stagingEnv = environments.find(({name}) => name === 'staging');
    let testEnv = environments.find(({name}) => name === 'test');

    if (!testEnv) {
        testEnv = await railwayClient.createEnvironment({
            name: "test",
            sourceEnvironmentId: stagingEnv.id,
            ephemeral: true
        });
    }

    const services = await railwayClient.getServices();
    console.log({services})
    for (const service of services) {
        console.log(`Service: ${service.name}`)
        const serviceVariables = await railwayClient.getServiceVariables({
            serviceId: service.id,
            environmentId: stagingEnv.id
        });
        // console.log(serviceVariables)
        const isUpdated = await railwayClient.upsertServiceVariablesInBulk({
            serviceId: service.id,
            environmentId: testEnv.id,
            variables: serviceVariables
        });
        console.log({isUpdated: JSON.stringify(isUpdated, null, 2)})
        console.log('Variables updated!');
    }



}

main().catch(console.error)