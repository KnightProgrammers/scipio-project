import { Static, Type } from "@sinclair/typebox";
import CountrySchema from "@/models/country.model";
export const Country = Type.Object({
  id: Type.Required(Type.String()),
  name: Type.Required(Type.String()),
  code: Type.Required(Type.String())
})

export type CountryType = Static<typeof Country>

const countries: any = async (fastify: any): Promise<void> => {
  fastify.get(
    '/', {
      schema: {
        response: {
          200: {
            type: 'array',
            items: Country
          }
        },
      },
    },
    async function (request: any, reply: any) {
      const countries = await CountrySchema.find({isSupported: true});
      reply.status(200).send(countries.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code
      })));
    });
}

export default countries;
