import { Static, Type } from "@sinclair/typebox";
import CurrencyModel from "@/models/currency.model";
import AuthMiddleware from "@/middlewares/auth.middleware";
export const Currency = Type.Object({
    id: Type.Required(Type.String()),
    name: Type.Required(Type.String()),
    code: Type.Required(Type.String())
})

export type CurrencyType = Static<typeof Currency>

const currencies: any = async (fastify: any): Promise<void> => {
    fastify.decorateRequest('user', null);
    fastify.addHook('onRequest', AuthMiddleware);

    fastify.get(
        '/', {
            schema: {
                response: {
                    200: {
                        type: 'array',
                        items: Currency
                    }
                },
            },
        },
        async function (request: any, reply: any) {
            const currencies = await CurrencyModel.find();
            reply.status(200).send(currencies.map(c => ({
                id: c.id,
                name: c.name,
                code: c.code
            })));
        });
}

export default currencies;