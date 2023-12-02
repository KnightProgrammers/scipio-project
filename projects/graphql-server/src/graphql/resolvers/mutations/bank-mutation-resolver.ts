import BankService from '@/services/bank.service';

type BankInput = {
    name: string;
}

export const BankMutation = {
	createBank: async (root: any, params: { input: BankInput }, context: any) => {
		const { name } = params.input;
		return BankService.create({
			name,
			user: context.auth,
		});
	},
	updateBank: async (root: any, params: {id: string, input: BankInput}, context: any) => {
		const { id, input } = params;
		const { name } = input;
		return BankService.update(id, context.auth, {
			name
		});
	},
	deleteBank: async (root: any, params: {id: string}, context: any) => {
		const {id} = params;
		try {
			await BankService.delete(id, context.auth);
			return true;
		} catch {
			return false;
		}
	},
};
