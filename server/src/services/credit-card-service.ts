import CreditCardModel from "@/models/credit-card.model";

class CreditCardService {
    static async getAll(userId: string) {
        return CreditCardModel.find({userId});
    }
}

export default CreditCardService;
