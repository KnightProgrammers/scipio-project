import RailwayService from '../services/railway.service.js';
const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);

const deleteEnvironmentCommand = async (environmentName) => {
    const environments = await railwayClient.getEnvironments();
    const environment = environments.find(({name}) => name === environmentName)
    if (!environment) {
      throw new Error('Environment not found')
    }
    await railwayClient.deleteEnvironment(environment.id);
    console.log(`Environment "${environmentName}" deleted.`)
  }

export default deleteEnvironmentCommand;