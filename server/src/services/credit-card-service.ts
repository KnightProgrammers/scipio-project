import { DateTime } from 'luxon';
import CreditCardModel from '@/models/credit-card.model';

class CreditCardService {
	static async getAll(userId: string) {
		return CreditCardModel.find({userId});
	}

	static async create(userId: string, data: {
		label?: string
		lastFourDigits?: string
		cardHolder: string
		expiration: string
		issuer: string
		status: string
		creditLimitAmount: number
		creditLimitCurrency: any
	}) {
		const parsedExpiration = DateTime.fromFormat(data.expiration, 'MMyy');

		return CreditCardModel.create({
			...data,
			expiration: parsedExpiration.toJSDate(),
			userId
		});
	}
	static async update(id: string, userId: string, data: {
		label?: string
		lastFourDigits?: string
		cardHolder: string
		expiration: string
		issuer: string
		status: string
		creditLimitAmount: number
		creditLimitCurrency: any
	}) {
		const creditCard = await this.findOne(id, userId);
		if (!creditCard) return null;
		const parsedExpiration = DateTime.fromFormat(data.expiration, 'MMyy');
		return CreditCardModel.findOneAndUpdate({ _id: id, userId }, {
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
		return CreditCardModel.findOne({ _id: id, userId });
	}
}

export default CreditCardService;
