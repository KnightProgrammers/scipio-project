import CurrencyModel from '@/models/currency.model';
import UserService from '@/services/user.service';
import { errorCodes } from 'fastify';
import CountryModel from '@/models/country.model';
import firebaseService from '@/services/firebase.service';

export const UserMutationResolver = {
	setUserCurrencies: async (root: any, params: { currencyIds: string[] }, context: any) => {
		const currencies = [];
		for (const currencyId of params.currencyIds) {
			const currency = await CurrencyModel.findById(currencyId);
			if (!currency) {
				throw new errorCodes.FST_ERR_NOT_FOUND('Currency');
			}
			currencies.push(currency);
		}
		const user = await UserService.findById(context.auth._id);
		user.currencies = currencies;
		user.save();
		return currencies;
	},
	updateProfile: async (root: any, params: {name: string, lang: string, countryName: string}, context: any) => {
		const {
			name,
			lang,
			countryName
		} = params;
		const country = await CountryModel.findOne({
			name: countryName,
			isSupported: true,
		});
		if (!country) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Country');
		}
		const user = await UserService.findById(context.auth._id);
		user.name = name;
		user.lang = lang;
		if (!user.country) {
			user.country = country;
		}
		firebaseService.auth().updateUser(user.firebaseId, {
			displayName: name
		});
		user.save();
		return user;
	}
};
