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

export async function apiGetUserBankAccountList(): Promise<unknown[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userBankAccounts',
            query: `
                query userBankAccounts { 
                    me { 
                        id 
                        bankAccounts { 
                            id
                            label
                            accountNumber
                            bank {
                                id
                                name
                            }
                            currency {
                                id
                                code
                            }
                            savings(statuses: [IN_PROGRESS, EXPIRED]) {
                                id
                            }
                        } 
                    }
                }
            `,
            variables: {},
        },
    })
    return response.data.data.me.bankAccounts
}

export async function apiCreateBankAccount(body: {
    accountName: string
    accountNumber: string
    accountBalance: number
    accountBankId: string
    accountCurrencyId: string
}): Promise<BankAccountDataType> {
    const {
        accountName,
        accountNumber,
        accountBalance,
        accountBankId,
        accountCurrencyId,
    } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createBankAccount',
            query: `
                mutation createBankAccount(
                    $label: String
                    $accountNumber: String!
                    $balance: Float!
                    $bankId: String!
                    $currencyId: String!
                ) {
                  createBankAccount(input: {
                    label: $label
                    accountNumber: $accountNumber
                    balance: $balance
                    bankId: $bankId
                    currencyId: $currencyId
                  }) {
                    id
                  }
                }
            `,
            variables: {
                label: accountName,
                accountNumber,
                balance: accountBalance,
                bankId: accountBankId,
                currencyId: accountCurrencyId,
            },
        },
    })
    return response.data
}

export async function apiUpdateBankAccount(body: {
    id: string
    accountName: string
    accountNumber: string
    accountBalance: number
    accountBankId: string
    accountCurrencyId: string
}): Promise<BankAccountDataType> {
    const { id, accountName, accountNumber, accountBalance } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'updateBankAccount',
            query: `
                mutation updateBankAccount(
                    $id: String!
                    $label: String
                    $accountNumber: String!
                    $balance: Float!
                ) {
                  updateBankAccount(id: $id, input: {
                    label: $label
                    accountNumber: $accountNumber
                    balance: $balance
                  }) {
                    id
                  }
                }
            `,
            variables: {
                id,
                label: accountName,
                accountNumber,
                balance: accountBalance,
            },
        },
    })
    return response.data
}

export async function apiDeleteBankAccount(
    bankAccountId: string,
): Promise<boolean> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'deleteBankAccount',
            query: `mutation deleteBankAccount($id: String!) {
              deleteBankAccount(id: $id)
            }`,
            variables: {
                id: bankAccountId,
            },
        },
    })
    return response.data
}
