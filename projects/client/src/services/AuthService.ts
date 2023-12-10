import ApiService from './ApiService'
import type { SignUpCredential, SignUpResponse } from '@/@types/auth'

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse>({
        url: '/auth/sign-up',
        method: 'post',
        data,
    })
}

export async function apiForgotPassword(data: {
    email: string
    baseUrl: string
}) {
    return ApiService.fetchData<any>({
        url: '/auth/forgot-password',
        method: 'post',
        data,
    })
}
