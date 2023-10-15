import { DateTime } from "luxon";

export const CreditCardQueryResolver = {
    expiration: (creditCard: any) => {
        return DateTime.fromJSDate(creditCard.expiration).toFormat('MM/yy')
    }
}
