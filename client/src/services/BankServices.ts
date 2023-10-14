import { BankDataType } from '@/@types/system'
import BaseService from '@/services/BaseService'

export async function apiGetBankList(): Promise<BankDataType[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userBanks',
            query: `query userBanks { me { id banks { id name icon bankAccounts { id } } } }`,
            variables: {},
        },
    })
    return response.data.data.me.banks
}

export async function apiCreateBank(body: {
    name: string
}): Promise<BankDataType> {
    const { name } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createBank',
            query: `
                mutation createBank(
                    $name: String!
                ) {
                  createBank(input: {
                    name: $name
                  }) {
                    id
                  }
                }
            `,
            variables: {
                name,
            },
        },
    })
    return response.data
}

export async function apiUpdateBank(body: BankDataType): Promise<BankDataType> {
    const { id, name } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'updateBank',
            query: `
                mutation updateBank(
                    $id: String!
                    $name: String!
                ) {
                  updateBank(id: $id, input: {
                    name: $name
                  }) {
                    id
                  }
                }
            `,
            variables: {
                id,
                name,
            },
        },
    })
    return response.data
}

export async function apiDeleteBank(bankId: string): Promise<BankDataType> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'deleteBank',
            query: `mutation deleteBank($id: String!) {
              deleteBank(id: $id)
            }`,
            variables: {
                id: bankId,
            },
        },
    })
    return response.data
}
