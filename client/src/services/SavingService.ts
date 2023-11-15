import BaseService from '@/services/BaseService'

type NewSavingInput = {
    name: string
}

type EditSavingInput = {
    id: string
    name: string
}

export async function apiGetSavingList(): Promise<any[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userSavings',
            query: `
                query userSavings { 
                    me { 
                        id 
                        savings { 
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
                            bankAccount {
                                id
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
            variables: {},
        },
    })
    return response.data.data.me.savings
}

export async function apiCreateSaving(data: NewSavingInput): Promise<any> {
    const { name } = data
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createSaving',
            query: `
                mutation createSaving(
                    $name: String!
                ) {
                  createSaving(input: {
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

export async function apiUpdateSaving(data: EditSavingInput): Promise<any> {
    const { id, name } = data
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'updateSaving',
            query: `
                mutation updateSaving(
                    $id: String!
                    $name: String!
                ) {
                  updateSaving(id: $id, input: {
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
