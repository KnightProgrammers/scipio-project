import ApiService from './ApiService'
import { BankDataType } from '@/@types/system'

export async function apiGetBankList(): Promise<BankDataType[]> {
    const { data } = await ApiService.fetchData<BankDataType[]>({
        url: '/banks',
        method: 'get',
    })
    return data
}

export async function apiCreateBank(body: {
    name: string
}): Promise<BankDataType> {
    const { data } = await ApiService.fetchData<BankDataType>({
        url: '/banks',
        method: 'post',
        data: body,
    })
    return data
}

export async function apiUpdateBank(body: BankDataType): Promise<BankDataType> {
    const { data } = await ApiService.fetchData<BankDataType>({
        url: `/banks/${body.id}`,
        method: 'put',
        data: body,
    })
    return data
}

export async function apiDeleteBank(bankId: string): Promise<BankDataType> {
    const { data } = await ApiService.fetchData<BankDataType>({
        url: `/banks/${bankId}`,
        method: 'delete',
    })
    return data
}
