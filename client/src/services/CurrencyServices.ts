import { CurrencyDataType } from '@/@types/system'
import BaseService from '@/services/BaseService'

export async function apiGetCurrencies(): Promise<CurrencyDataType[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            "operationName": "currencies",
            "query": `query currencies { currencies { id code } }`,
            "variables": {}
        }
    })
    return response.data.data.currencies;
}
