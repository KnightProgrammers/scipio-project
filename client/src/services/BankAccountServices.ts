import ApiService from './ApiService'
import { BankAccountDataType } from '@/@types/system'

export async function apiGetBankAccountList(): Promise<any[]> {
    const { data } = await ApiService.fetchData<any[]>({
        url: '/bank-accounts',
        method: 'get',
    })
    return data
}

export async function apiCreateBankAccount(body: {
    accountName: string
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

export async function apiUpdateBankAccount(
    body: BankAccountDataType,
): Promise<BankAccountDataType> {
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
