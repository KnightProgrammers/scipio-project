import RailwayService from '../services/railway.service.js'
import delay from './delay.js'
import toTitleCase from './to-title-case.js'

const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID)

const waitForDeployRecursive = async (deployment) => {
    const { id, status } = deployment

    const inProgressStatus = [
        'BUILDING',
        'DEPLOYING',
        'INITIALIZING',
        'QUEUED',
        'REMOVING',
        'WAITING',
    ]

    if (inProgressStatus.includes(status)) {
        console.log(`${toTitleCase(status)}...`)
        await delay(10000) // Check every 10seconds
        const deploymentUpdated = await railwayClient.getDeployment(id)
        return waitForDeployRecursive(deploymentUpdated)
    }
}

const waitForDeployToFinish = async (serviceName, environmentName) => {
    const environments = await railwayClient.getEnvironments()

    const targetEnv = environments.find(({ name }) => name === environmentName)

    const services = await railwayClient.getServices()
    const service = services.find(({ name }) => name === serviceName)
    const deployment = await railwayClient.getLatestDeployment({
        first: 1,
        serviceId: service.id,
        environmentId: targetEnv.id,
    })
    await waitForDeployRecursive(deployment)
}

export default waitForDeployToFinish
