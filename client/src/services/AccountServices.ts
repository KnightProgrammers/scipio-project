import BaseService from '@/services/BaseService'

export async function apiGetUserProfile() {
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
