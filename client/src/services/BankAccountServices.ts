import ApiService from './ApiService'
import { BankAccountDataType } from '@/@types/system'
import BaseService from '@/services/BaseService'

export async function apiGetBankAccountList(): Promise<unknown[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userBankAccounts',
            query: `query userBankAccounts { me { id banks { id name icon bankAccounts { id accountName: label accountNumber accountBalance: balance accountCurrency: currency { id code } } } } }`,
            variables: {},
        },
    })
    return response.data.data.me.banks
}

export async function apiCreateBankAccount(body: {
    accountName: string
    accountNumber: string
    accountBalance: number
    accountBankId: string
    accountCurrencyId: string
}): Promise<BankAccountDataType> {
    const { data } = await ApiService.fetchData<BankAccountDataType>({
        url: '/bank-accounts',
        method: 'post',
        data: body,
    })
    return data
}

export async function apiUpdateBankAccount(body: {
    id: string
    accountName: string
    accountNumber: string
    accountBalance: number
    accountBankId: string
    accountCurrencyId: string
}): Promise<BankAccountDataType> {
    const { data } = await ApiService.fetchData<BankAccountDataType>({
        url: `/bank-accounts/${body.id}`,
        method: 'put',
        data: body,
    })
    return data
}

export async function apiDeleteBankAccount(
    bankAccountId: string,
): Promise<BankAccountDataType> {
    const { data } = await ApiService.fetchData<BankAccountDataType>({
        url: `/bank-accounts/${bankAccountId}`,
        method: 'delete',
    })
    return data
}
