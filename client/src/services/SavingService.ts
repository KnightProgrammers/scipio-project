import BaseService from '@/services/BaseService'

type NewSavingInput = {
    name: string
    targetDate: string
    targetAmount: number
    bankAccountId: string
}

type EditSavingInput = {
    id: string
    name: string
    targetDate: string
    targetAmount: number
    bankAccountId: string
    status: string
}

export async function apiGetSavingList(filters: {
    statuses: string[]
}): Promise<any[]> {
    const { statuses = ['IN_PROGRESS'] } = filters
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userSavings',
            query: `
                query userSavings(
                    $statuses: [SavingStatus!]
                ) { 
                    me { 
                        id 
                        savings(statuses: $statuses) { 
                            id 
                            name  
                            description
                            status
                            targetDate
                            targetAmount
                            currency {
                                id
                                code
                            }
                            bankAccountId
                            bankAccount {
                                id
                                label
                                balance
                                accountNumber
                                bank {
                                    id
                                    name
                                    icon
                                }
                            }
                        } 
                    } 
                }
            `,
            variables: {
                statuses: statuses,
            },
        },
    })
    return response.data.data.me.savings
}

export async function apiCreateSaving(data: NewSavingInput): Promise<any> {
    const { name, targetAmount, targetDate, bankAccountId } = data
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createSaving',
            query: `
                mutation createSaving(
                    $name: String!
                    $targetAmount: Float!
                    $targetDate: String!
                    $bankAccountId: String!
                ) {
                  createSaving(input: {
                    name: $name
                    targetAmount: $targetAmount
                    targetDate: $targetDate
                    bankAccountId: $bankAccountId
                  }) {
                    id
                  }
                }
            `,
            variables: {
                name,
                targetAmount,
                targetDate,
                bankAccountId,
            },
        },
    })
    return response.data
}

export async function apiUpdateSaving(data: EditSavingInput): Promise<any> {
    const { id, name, targetAmount, targetDate, bankAccountId, status } = data
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'updateSaving',
            query: `
                mutation updateSaving(
                    $id: String!
                    $name: String!
                    $targetAmount: Float!
                    $targetDate: String!
                    $bankAccountId: String!
                    $status: SavingStatus!
                ) {
                  updateSaving(id: $id, input: {
                    name: $name
                    targetAmount: $targetAmount
                    targetDate: $targetDate
                    bankAccountId: $bankAccountId
                    status: $status
                  }) {
                    id
                  }
                }
            `,
            variables: {
                id,
                name,
                targetAmount,
                targetDate,
                bankAccountId,
                status,
            },
        },
    })
    return response.data
}

export async function apiDeleteSaving(savingId: string): Promise<any> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'deleteSaving',
            query: `mutation deleteSaving($id: String!) {
              deleteSaving(id: $id)
            }`,
            variables: {
                id: savingId,
            },
        },
    })
    return response.data
}
