import CreditCardStatementPaymentSchema from '@/models/credit-card-statement-payment.model';
import CurrencyService from '@/services/currency.service';
import { DateTime } from 'luxon';

type CreateStatementPaymentInput = {
    paymentDate: DateTime
	monthlyStatementId: string
    currencies: [{
        currencyCode: string
        amount: number
		type: 'TOTAL'|'PARTIAL'|'MINIMUM'
    }]
}

class CreditCardStatementPaymentService {

	static async create(userId: string, data: CreateStatementPaymentInput) {
		const {
			paymentDate,
			monthlyStatementId,
			currencies
		} = data;

		const currencyFormatted = [];

		for (const c of currencies) {
			const currency = await CurrencyService.findByCode(c.currencyCode);
			currencyFormatted.push({
				currency,
				type: c.type,
				amount: c.amount
			});
		}

		return CreditCardStatementPaymentSchema.create({
			paymentDate: paymentDate.set({
				hour: 0,
				minute: 0,
				second: 0,
				millisecond: 0
			})
				.toJSDate(),
			creditCardMonthlyStatementId: monthlyStatementId,
			currencies: currencyFormatted,
			userId
		});
	}

	static async delete(id: string, userId: string) {
		const statementPayment = await this.findOne(id, userId);
		if (!statementPayment) {
			return false;
		}
		await statementPayment.deleteOne();
		return true;
	}

	static async findOne(id: string, userId: string) {
		if (!id || !userId) return null;
		return CreditCardStatementPaymentSchema.findOne({ _id: id, userId });
	}
	static async findByStatementId(creditCardMonthlyStatementId: string, userId: string) {
		return CreditCardStatementPaymentSchema.findOne({
			userId,
			creditCardMonthlyStatementId
		});
	}
}

export default CreditCardStatementPaymentService;
