import BaseService from '@/services/BaseService'

export async function apiUserProfile() {
    return BaseService.request({
        url: '/users/me',
        method: 'get',
    })
}
