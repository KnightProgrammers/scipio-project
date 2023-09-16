import ApiService from './ApiService'
import { CountryDataType } from '@/@types/system'

export async function apiGetCountryList() {
    return ApiService.fetchData<CountryDataType[]>({
        url: '/countries',
        method: 'get',
    })
}
