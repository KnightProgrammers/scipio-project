import CreditCardService from "@/services/credit-card-service";
import CurrencyService from "@/services/currency.service";

type CreditCardInput = {
	label?: string;
	lastFourDigits?: string;
	cardHolder: string;
	expiration: string;
	issuer: string;
	status: string;
	creditLimitAmount: number;
	creditLimitCurrencyId: string;
};

export const CreditCardMutationResolver = {
	createCreditCard: async (
		root: any,
		params: { input: CreditCardInput },
		context: any
	) => {
		const {
			label,
			lastFourDigits,
			cardHolder,
			expiration,
			issuer,
			status,
			creditLimitAmount,
			creditLimitCurrencyId,
		} = params.input;
		const creditLimitCurrency = await CurrencyService.findOne(creditLimitCurrencyId);
		return CreditCardService.create(context.auth._id, {
			label,
			lastFourDigits,
			cardHolder,
			expiration,
			issuer,
			status,
			creditLimitAmount,
			creditLimitCurrency
		});
	},
	updateCreditCard: async (
		root: any,
		params: { id: string; input: CreditCardInput },
		context: any
	) => {
		const { id, input } = params;
		const {
			label,
			lastFourDigits,
			cardHolder,
			expiration,
			issuer,
			status,
			creditLimitAmount,
			creditLimitCurrencyId,
		} = input;
		const creditLimitCurrency = await CurrencyService.findOne(creditLimitCurrencyId);
		return CreditCardService.update(id, context.auth._id, {
			label,
			lastFourDigits,
			cardHolder,
			expiration,
			issuer,
			status,
			creditLimitAmount,
			creditLimitCurrency
		});
	},
	deleteCreditCard: async (root: any, params: { id: string }, context: any) => {
		const { id } = params;
		return CreditCardService.delete(id, context.auth._id);
	},
};
