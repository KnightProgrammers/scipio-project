import BankSchema from "@/models/bank.model";
import { UserType } from "@/routes/users";
import { BankType } from "@/@types/bank.type";

class BankService {
    static async getAll(user: UserType) {
        return BankSchema.find({user}).sort({name:1});
    }
    static async create(data: {name: string, user: UserType}) {
        const { name, user } = data;
        return BankSchema.create({ name, user });
    }
    static async update(id: string, user: UserType, data: { name: string, icon: string }) {
        const { name, icon } = data;

        const bank = await BankSchema.findOne({_id: id, user});

        if (!bank) return null;

        bank.name = name;
        bank.icon = icon;

        await bank.save()

        return bank;
    }
    static async delete(id: string, user: UserType) {
        return BankSchema.findOneAndDelete({
            _id: id,
            user
        });
    }
    static async findOne(id: string, user: UserType): Promise<BankType|null> {
        return BankSchema.findOne({_id: id, user});
    }
}

export default BankService;
