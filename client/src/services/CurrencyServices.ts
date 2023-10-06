import { CurrencyDataType } from '@/@types/system'
import BaseService from '@/services/BaseService'

export async function apiGetCurrencies(): Promise<CurrencyDataType[]> {
    const { data } = await BaseService.request({
        url: '/currencies',
        method: 'get',
    })
    return data
}
