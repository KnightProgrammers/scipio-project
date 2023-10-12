import * as gavatar from "gravatar";
import BankService from "@/services/bank.service";

export const UserQueryResolver = {
    id: (user: any) => user._id,
    avatar: (user: any) => {
        if (!!user.avatar) return user.avatar;
        return gavatar.url(user.email, {
            protocol: 'https',
            s: '100',
        })
    },
    country: (user: any) => {
        return {
            id: user.country._id,
            name: user.country.name
        }
    },
    currencies: (user: any) => {
        return user.currencies.map((c: any) => ({
            id: c._id,
            code: c.code
        }))
    },
    banks: async (user: any) => BankService.getAll(user)
}
