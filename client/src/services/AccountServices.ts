import BaseService from '@/services/BaseService'
import { UserDataType } from '@/@types/system'

export async function apiGetUserProfile(): User {
    return BaseService.request({
        url: '/users/me',
        method: 'get',
    })
}

export async function apiUpdateUserProfile(data: object) {
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
