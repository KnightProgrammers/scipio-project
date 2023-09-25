import { CurrencyType } from "@/@types/currency.type";
import CurrencySchema from "@/models/currency.model";

class CurrencyService {
    static async findOne(id: string): Promise<CurrencyType|null> {
        return CurrencySchema.findById(id);
    }
}

export default CurrencyService;
