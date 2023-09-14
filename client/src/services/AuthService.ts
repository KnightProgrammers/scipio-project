import ApiService from './ApiService'
import type { SignUpCredential, SignUpResponse } from '@/@types/auth'

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse>({
        url: '/auth/sign-up',
        method: 'post',
        data,
    })
}
