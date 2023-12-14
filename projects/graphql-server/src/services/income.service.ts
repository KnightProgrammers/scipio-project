import { DateTime } from 'luxon';
import IncomeModel from '@/models/income.model';
import BankAccountService from '@/services/bank-account.service';
import CurrencyService from '@/services/currency.service';

interface IncomeInput {
	amount: number,
	incomeDate: Date,
	description?: string,
	bankAccountId?: string,
}

const parseFilterDate = (stringDate: string | undefined, defaultDay: number) => {
	const formattedDate = stringDate ?
		DateTime.fromISO(stringDate) :
		DateTime.now().set({day: defaultDay});

	return formattedDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
};

class IncomeService {
	static async getAll(userId: string, fromDate?: string, toDate?: string) {
		const formattedFromDate = parseFilterDate(fromDate, 1);
		const formattedToDate = parseFilterDate(toDate, 32);

		return IncomeModel
			.find({
				userId,
				incomeDate: {
					$gte: formattedFromDate.toJSDate(),
					$lte: formattedToDate.toJSDate()
				},
				isDeleted: false
			})
			.sort({ incomeDate: -1 });
	}
	static async create(userId: string, data: IncomeInput) {
		const {
			amount,
			incomeDate,
			description = '',
			bankAccountId
		} = data;
		const bankAccount = await BankAccountService.findOne(bankAccountId, userId);
        if (!bankAccount) {
            return null;
        }
        const newBalance: number = bankAccount.accountBalance - amount;
        await BankAccountService.updateBalance(bankAccountId, userId, newBalance);

        const currency = await CurrencyService.findByCode(bankAccount.accountCurrency.code);
        if (!currency) {
            return null;
        }

		return IncomeModel.create({
			amount,
			incomeDate,
			description,
			currencyId: currency._id,
			bankAccountId,
			userId
		});
	}
	static async delete(id: string, userId: string) {
		const income = await this.findOne(id, userId);
		if (!income) return false;

		const bankAccount = await BankAccountService.findOne(income.bankAccountId.toString(), userId);
        if (!bankAccount) {
            return false;
        }
        const newBalance: number = bankAccount.accountBalance + income.amount;
        await BankAccountService.updateBalance(income.bankAccountId.toString(), userId, newBalance);
		await income.deleteOne()
        return true;
	}
	static async findOne(id: string, userId: any) {
		return IncomeModel.findOne({ _id: id, userId });
	}
}

export default IncomeService;