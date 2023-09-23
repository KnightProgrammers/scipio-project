import AuthMiddleware from "@/middlewares/auth.middleware";
import { UserType } from "@/routes/users";
import BankService from "@/services/bank.service";
import { BankAccount } from "@/@types/bank-account.type";
import BankAccountService from "@/services/bank-account.service";


const countries: any = async (fastify: any): Promise<void> => {
  fastify.decorateRequest('user', null);
  fastify.addHook('onRequest', AuthMiddleware);

  fastify.get(
    '/', {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              id: 'string',
              name: 'string',
              icon: 'string',
              accounts: [BankAccount]
            }
          }
        },
      },
    },
    async function (request: any, reply: any) {
      const user: UserType = request.user;
      const result = [];
      const banks = await BankService.getAll(user);
      for (const bank of banks) {
        const bankAccounts = await BankAccountService.getAll(bank.id, user);
        result.push({
          id: bank.id,
          name: bank.name,
          icon: bank.icon,
          accounts: bankAccounts.map(ba => ({
            id: ba.id,
            accountNumber: ba.accountNumber,
            accountBalance: ba.accountBalance,
          }))
        })
      }
      reply.status(200).send(result);
    });

  fastify.post(
    '/', {
      schema: {
        body: {
          type: 'object',
          properties: {
            accountNumber: {
              type: 'string'
            },
            accountBalance: {
              type: 'number'
            }
          }
        },
        response: {
          201: BankAccount
        },
      },
    },
    async function (request: any, reply: any) {
      const user: UserType = request.user;
      const { name } = request.body;
      const bank = await BankService.create({ name, user });
      reply.status(201).send({
        id: bank.id,
        name: bank.name,
        icon: bank.icon
      });
    });
}

export default countries;
