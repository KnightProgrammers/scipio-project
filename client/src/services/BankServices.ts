import ApiService from './ApiService'
import { BankDataType } from '@/@types/system'
import BaseService from "@/services/BaseService";

export async function apiGetBankList(): Promise<BankDataType[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            "operationName": "userBanks",
            "query": `query userBanks { me { id banks { id name icon bankAccounts { id } } } }`,
            "variables": {}
        }
    })
    return response.data.data.me.banks;
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
