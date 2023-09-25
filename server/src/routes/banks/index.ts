import AuthMiddleware from "@/middlewares/auth.middleware";
import { UserType } from "@/routes/users";
import BankService from "@/services/bank.service";
import { Bank } from "@/@types/bank.type";
import { errorCodes } from "fastify";
import BankAccountService from "@/services/bank-account.service";
import { Type } from "@sinclair/typebox";


const banks: any = async (fastify: any): Promise<void> => {
  fastify.decorateRequest('user', null);
  fastify.addHook('onRequest', AuthMiddleware);

  fastify.get(
      '/', {
        schema: {
          response: {
            200: {
              type: 'array',
              items: Type.Object({
                id: Type.Optional(Type.String()),
                name: Type.Required(Type.String()),
                icon: Type.Optional(Type.String()),
                accountsCount: Type.Required(Type.Number())
              })
            }
          },
        },
      },
      async function (request: any, reply: any) {
        const user: UserType = request.user;
        const banks = await BankService.getAll(user);

        const response = await Promise.all(banks.map(async b => {
          const accounts = await BankAccountService.getAll(b, user);
          const accountsCount: Number = accounts.length;
          return {
            id: b.id,
            name: b.name,
            icon: b.icon,
            accountsCount
          }
        }))
        reply.status(200).send(response);
      });

  fastify.post(
      '/', {
        schema: {
          body: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              }
            }
          },
          response: {
            201: Bank
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

  fastify.put(
      '/:id', {
        schema: {
          params: {
            id: {
              type: 'string'
            }
          },
          body: Bank,
          response: {
            200: Bank
          },
        },
      },
      async function (request: any, reply: any) {
        const user: UserType = request.user;
        const { id } = request.params;
        const { name, icon } = request.body;
        const bank = await BankService.update(id, user, { name, icon });
        if (!bank) {
          throw new errorCodes.FST_ERR_NOT_FOUND('Bank');
        }
        reply.status(200).send({
          id: bank.id,
          name: bank.name,
          icon: bank.icon
        });
      });

  fastify.delete(
      '/:id', {
        schema: {
          params: {
            id: {
              type: 'string'
            }
          },
          response: {
            204: {}
          },
        },
      },
      async function (request: any, reply: any) {
        const user: UserType = request.user;
        const { id } = request.params;
        const bank = await BankService.findOne(id, user);
        if (!bank) {
          throw new errorCodes.FST_ERR_NOT_FOUND('Bank');
        }
        const accounts = await BankAccountService.getAll(bank, user);
        if (accounts.length > 0) {
          throw new errorCodes.FST_ERR_VALIDATION('Bank has account');
        } else {
          await BankService.delete(id, user);
          reply.status(204).send();
        }
      });
}

export default banks;
