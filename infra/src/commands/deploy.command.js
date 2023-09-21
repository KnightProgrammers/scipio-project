
import {execSync} from 'child_process'
import RailwayService from '../services/railway.service.js';
const railwayClient = new RailwayService(process.env.RAILWAY_PROJECT_ID);

const AVAILABLE_SERVICES = [
    'scipio-client',
    'scipio-server'
]

const deployCommand = async (serviceName, options) => {
    try {
       //  execSync('railway').toString("utf8");
    } catch {
        console.log('Error')
    }
    // console.log(stdout)
    console.log({serviceName})
    // console.log({options})
  }

export default deployCommand;