import CurrencyModel from '@/models/currency.model';
import UserService from '@/services/user.service';
import { errorCodes } from 'fastify';
import CountryModel from '@/models/country.model';
import firebaseService from '@/services/firebase.service';
import i18n from "@/locales";
import { EmailQueue } from "@/queues/email.queue";
import { config } from "@/config";

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
		if (!user.lang) {
			await i18n.changeLanguage(lang || 'en');
			await EmailQueue.sendEmail({
				type: 'welcome-email',
				recipients: user.email,
				subject: i18n.t('emails.welcome.subject'),
				fields: {
					user_hi: i18n.t('emails.welcome.userHi', { name }),
					welcome_header: i18n.t('emails.welcome.welcomeHeader'),
					label_cta: i18n.t('emails.welcome.labelCta'),
					link_cta: config.app.webUrl
				}
			});
		}
		user.lang = lang;
		if (!user.country) {
			user.country = country;
		}
		await firebaseService.auth().updateUser(user.firebaseId, {
			displayName: name
		});
		await user.save();
		return user;
	}
};
