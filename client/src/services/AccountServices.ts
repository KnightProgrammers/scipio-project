import BaseService from '@/services/BaseService'
import { CurrencyDataType, UserDataType } from '@/@types/system'

export async function apiGetUserProfile(): Promise<UserDataType> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            "operationName": "currentUserInfo",
            "query": `query currentUserInfo { me { id name email avatar lang country { id code name } } }`,
            "variables": {}
        }
    })
    return response.data.data.me;
}

export async function apiUpdateUserProfile(
    data: object,
): Promise<UserDataType> {
    return BaseService.request({
        url: '/users/me',
        method: 'post',
        data,
    })
}

export async function apiPathUserProfile(
    country: string,
    lang: string,
    currencies: string[],
): Promise<UserDataType> {
    return BaseService.request({
        url: '/users/me',
        method: 'patch',
        data: {
            country,
            lang,
            currencies,
        },
    })
}

export async function apiGetUserCurrencies(): Promise<CurrencyDataType[]> {
    const { data } = await BaseService.request({
        url: '/users/me/currencies',
        method: 'get',
    })
    return data
}

export async function apiSetUserCurrencies(
    data: string[],
): Promise<CurrencyDataType[]> {
    const response = await BaseService.request({
        url: '/users/me/currencies',
        method: 'post',
        data,
    })
    return response.data
}
