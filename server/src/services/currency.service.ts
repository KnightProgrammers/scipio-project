import CurrencySchema from '@/models/currency.model';

class CurrencyService {
	static async findAll() {
		return CurrencySchema.find().sort({ code: 1 });
	}
	static async findOne(id: string) {
		return CurrencySchema.findById(id);
	}
}

export default CurrencyService;
