import CountryModel from '@/models/country.model';

class CountryService {
	static async getAll() {
		return CountryModel.find().sort({ name: 1 });
	}
}

export default CountryService;
