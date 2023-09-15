import * as console from "console";
import mongoose from "mongoose";
import { config } from "@/config";
import CountryModel from "@/models/country.model";

const main = async function() {

  await mongoose
    .connect(`${config.db.protocol}://${config.db.host}${config.db.port ? `:${config.db.port}` : ''}/${!!config.db.name ? config.db.name : ''}${!!config.db.params && config.db.params}`, {
      user: config.db.user,
      pass: config.db.password,
      autoCreate: true,
    });


  const uy = await CountryModel.create({
    name: 'Uruguay'
  });

  console.log(uy)
}

main().then(() => {
  console.log('Done')
}).catch(
  console.error
)
