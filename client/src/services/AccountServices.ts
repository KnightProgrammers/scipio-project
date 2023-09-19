import BaseService from '@/services/BaseService'
import { CurrencyType, UserDataType } from "@/@types/system";

export async function apiGetUserProfile(): Promise<UserDataType> {
    return BaseService.request({
        url: '/users/me',
        method: 'get',
    })
}

export async function apiUpdateUserProfile(data: object): Promise<UserDataType> {
    return BaseService.request({
        url: '/users/me',
        method: 'post',
        data,
    })
}

export async function apiPathUserProfile(
    country: string,
    lang: string,
): Promise<UserDataType> {
    return BaseService.request({
        url: '/users/me',
        method: 'patch',
        data: {
            country,
            lang,
        },
    })
}

export async function apiGetUserCurrencies(): Promise<CurrencyType[]> {
    const {data} = await BaseService.request({
        url: '/users/me/currencies',
        method: 'get',
    });
    return data;
}

export async function apiSetUserCurrencies(data: string[]): Promise<CurrencyType[]> {
    const response = await BaseService.request({
        url: '/users/me/currencies',
        method: 'post',
        data
    });
    return response.data;
}
