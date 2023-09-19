import ApiService from './ApiService'
import { CountryDataType, CurrencyType } from '@/@types/system'
import BaseService from '@/services/BaseService'

export async function apiGetCountryList() {
    return ApiService.fetchData<CountryDataType[]>({
        url: '/countries',
        method: 'get',
    })
}

export async function apiGetCurrencies(): Promise<CurrencyType[]> {
    const { data } = await BaseService.request({
        url: '/currencies',
        method: 'get',
    })
    return data
}
