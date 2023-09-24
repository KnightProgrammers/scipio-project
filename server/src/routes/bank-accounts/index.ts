import AuthMiddleware from "@/middlewares/auth.middleware";
import { UserType } from "@/routes/users";
import BankService from "@/services/bank.service";
import { BankAccount } from "@/@types/bank-account.type";
import BankAccountService from "@/services/bank-account.service";
import { errorCodes } from "fastify";
import { BankType } from "@/@types/bank.type";


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
          accounts: bankAccounts.map(ba => ({
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
        body: BankAccount,
        response: {
          201: BankAccount
        },
      },
    },
    async function (request: any, reply: any) {
      const user: UserType = request.user;
      const { accountName, accountBankId, accountNumber, accountBalance, accountCurrency } = request.body;
      const accountBank = await BankService.findOne(accountBankId, user);
      if (!accountBank) {
        throw new errorCodes.FST_ERR_NOT_FOUND('Bank');
      }
      const bankAccount = await BankAccountService.create({
        accountName,
        accountNumber,
        accountBalance,
        accountBankId,
        accountCurrency,
        accountUserId: user.id
      });
      reply.status(201).send({
        accountName: bankAccount.accountName,
        accountNumber: bankAccount.accountNumber,
        accountBalance: bankAccount.accountBalance,
        accountCurrency: bankAccount.accountCurrency,
        accountBankId: bankAccount.accountBankId
      });
    });
}

export default bankAccounts;
