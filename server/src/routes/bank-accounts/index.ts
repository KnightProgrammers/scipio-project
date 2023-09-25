import AuthMiddleware from "@/middlewares/auth.middleware";
import { UserType } from "@/routes/users";
import BankService from "@/services/bank.service";
import { BankAccount, NewBankAccountBody } from "@/@types/bank-account.type";
import BankAccountService from "@/services/bank-account.service";
import { errorCodes } from "fastify";
import { BankType } from "@/@types/bank.type";
import CurrencyService from "@/services/currency.service";


const bankAccounts: any = async (fastify: any): Promise<void> => {
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
      const banks: BankType[] = await BankService.getAll(user);
      for (const bank of banks) {
        const bankAccounts = await BankAccountService.getAll(bank, user);
        result.push({
          id: bank.id,
          name: bank.name,
          icon: bank.icon,
          accounts: bankAccounts.map((ba: any) => ({
            id: ba.id,
            accountName: ba.accountName,
            accountNumber: ba.accountNumber,
            accountBalance: ba.accountBalance,
            accountCurrency: {
              id: ba.accountCurrency.id,
              code: ba.accountCurrency.code
            },
          }))
        })
      }
      reply.status(200).send(result);
    });

  fastify.post(
    '/', {
      schema: {
        body: NewBankAccountBody,
        response: {
          201: BankAccount
        },
      },
    },
    async function (request: any, reply: any) {
      const user: UserType = request.user;
      const { accountName, accountBankId, accountNumber, accountBalance, accountCurrencyId } = request.body;
      const accountBank = await BankService.findOne(accountBankId, user);
      if (!accountBank) {
        throw new errorCodes.FST_ERR_NOT_FOUND('Bank');
      }
      const accountCurrency = await CurrencyService.findOne(accountCurrencyId);
      if (!accountCurrency) {
        throw new errorCodes.FST_ERR_NOT_FOUND('Currency');
      }
      const bankAccount: any = await BankAccountService.create({
        accountName,
        accountNumber,
        accountBalance,
        accountBankId,
        accountCurrency,
        accountUserId: user.id
      });
      reply.status(201).send({
        id: bankAccount.id,
        accountName: bankAccount.accountName,
        accountNumber: bankAccount.accountNumber,
        accountBalance: bankAccount.accountBalance,
        accountCurrency: {
          id: bankAccount.accountCurrency.id,
          code: bankAccount.accountCurrency.code,
          name: bankAccount.accountCurrency.name
        },
        accountBankId: bankAccount.accountBankId
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
          body: NewBankAccountBody,
          response: {
            200: BankAccount
          },
        },
      },
      async function (request: any, reply: any) {
        const user: UserType = request.user;
        const { id } = request.params;
        const { accountName, accountBalance, accountNumber } = request.body;
        const bankAccount = await BankAccountService.findOne(id, user);
        if (!bankAccount) {
          throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
        }
        const editedBankAccount: any = await BankAccountService.update(id, user, {
          accountName,
          accountNumber,
          accountBalance
        })
        reply.status(200).send({
          id: editedBankAccount.id,
          accountName: editedBankAccount.accountName,
          accountNumber: editedBankAccount.accountNumber,
          accountBalance: editedBankAccount.accountBalance,
          accountCurrency: {
            id: editedBankAccount.accountCurrency.id,
            code: editedBankAccount.accountCurrency.code,
            name: editedBankAccount.accountCurrency.name
          },
          accountBankId: editedBankAccount.accountBankId
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
        const bankAccount = await BankAccountService.findOne(id, user);
        if (!bankAccount) {
          throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
        }

        await BankAccountService.delete(id, user)
        reply.status(204).send();
      });
}

export default bankAccounts;
