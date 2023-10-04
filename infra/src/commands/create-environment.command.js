import figlet from 'figlet'
import RailwayService from '../services/railway.service.js'

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID)
const createEnvironment = async (name) => {
    console.log(
        figlet.textSync('Create Envitonment', {
            font: 'AMC 3 Line',
        }),
    )
    const environmentName = name.toLowerCase()
    const environments = await railwayClient.getEnvironments()

    const stagingEnv = environments.find(({ name }) => name === 'staging')
    let targetEnv = environments.find(({ name }) => name === environmentName)

    if (!targetEnv) {
        targetEnv = await railwayClient.createEnvironment({
            name: environmentName,
            sourceEnvironmentId: stagingEnv.id,
            ephemeral: true,
        })
        const services = await railwayClient.getServices()
        await Promise.all(
            services.map(async (service) => {
                const serviceVariables =
                    await railwayClient.getServiceVariables({
                        serviceId: service.id,
                        environmentId: stagingEnv.id,
                    })
                await railwayClient.upsertServiceVariablesInBulk({
                    serviceId: service.id,
                    environmentId: targetEnv.id,
                    variables: serviceVariables,
                })
            }),
        )
        console.log(`Environment "${environmentName}" successfully created`)
    } else {
        console.log('Environment already exist')
    }
}

export default createEnvironment
