import { DateTime } from 'luxon';
import CreditCardSchema from '@/models/credit-card.model';

export type CREDIT_CARD_STATUS_TYPE = 'ACTIVE'|'EXPIRED'|'BLOCKED';

class CreditCardService {
	static async getAll(userId: string, statuses?: CREDIT_CARD_STATUS_TYPE[]) {
		let query: any = { userId };
		if (statuses) {
			query = {
				...query,
				status: statuses
			}
		}
		return CreditCardSchema.find(query).sort({ label: 1 })
	}

	static async create(userId: string, data: {
		label: string
		lastFourDigits?: string
		cardHolder?: string
		expiration: string
		issuer: string
		status: string
		creditLimitAmount: number
		creditLimitCurrency: any
	}) {
		const parsedExpiration = DateTime.fromFormat(data.expiration, 'MMyy');

		return CreditCardSchema.create({
			...data,
			expiration: parsedExpiration.toJSDate(),
			userId
		});
	}
	static async update(id: string, userId: string, data: {
		label: string
		lastFourDigits?: string
		cardHolder?: string
		expiration: string
		issuer: string
		status: string
		creditLimitAmount: number
		creditLimitCurrency: any
	}) {
		const creditCard = await this.findOne(id, userId);
		if (!creditCard) return null;
		const parsedExpiration = DateTime.fromFormat(data.expiration, 'MMyy');
		return CreditCardSchema.findOneAndUpdate({ _id: id, userId }, {
			...data,
			expiration: parsedExpiration.toJSDate(),
		});
	}

	static async delete(id: string, userId: string) {
		const creditCard = await this.findOne(id, userId);
		if (!creditCard) return false;
		await creditCard.deleteOne();
		return true;
	}


	static async findOne(id: string, userId: string) {
		if (!id || !userId) return null;
		return CreditCardSchema.findOne({ _id: id, userId });
	}
}

export default CreditCardService;
