import BaseService from '@/services/BaseService'

type CreditCardInput = {
    id?: string
    label: string
    lastFourDigits?: string
    cardHolder?: string
    expiration: string
    issuer: string
    status: string
    creditLimitAmount: number
    creditLimitCurrencyId: string
}

export async function apiGetCreditCardList(): Promise<any[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userCreditCards',
            query: `
                query userCreditCards { 
                    me {
                        id
                        creditCards {
                          id
                          label
                          cardHolder
                          lastFourDigits
                          expiration
                          issuer
                          status
                          creditLimitAmount
                          creditLimitCurrency {
                            id
                            code
                          }
                        }
                    }
                }
            `,
            variables: {},
        },
    })
    return response.data.data.me.creditCards
}

export async function apiGetCreditCardListForSelect(): Promise<any[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userCreditCards',
            query: `
                query userCreditCards { 
                    me {
                        id
                        creditCards {
                          id
                          label
                          lastFourDigits
                          issuer
                          cardHolder
                          status
                        }
                    }
                }
            `,
            variables: {},
        },
    })
    return response.data.data.me.creditCards
}

export async function apiGetCreditCard(id: string): Promise<any[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userCreditCard',
            query: `
                query userCreditCard($id: String!) { 
                    me { 
                        id 
                        creditCard(id: $id) { 
                            id
                            monthlyStatements {
                                id
                                closeDate
                                expenses {
                                  id
                                  billableDate
                                  amount
                                  description
                                  category { id name }
                                  currency { id code }
                                }
                            }
                            expensesNextStatement {
                                id
                                billableDate
                                amount
                                description
                                category { id name }
                                currency { id code }
                            }
                        }
                    } 
                }
            `,
            variables: {
                id,
            },
        },
    })
    return response.data.data.me.creditCard
}

export async function apiCreateCreditCard(body: CreditCardInput): Promise<any> {
    const {
        label,
        lastFourDigits,
        cardHolder,
        expiration,
        issuer,
        status,
        creditLimitAmount,
        creditLimitCurrencyId,
    } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createCreditCard',
            query: `
                mutation createCreditCard(
                    $label: String!
                    $lastFourDigits: String
                    $cardHolder: String
                    $expiration: String!
                    $issuer: CreditCardIssuer!
                    $status: CreditCardStatus!
                    $creditLimitAmount: Float!
                    $creditLimitCurrencyId: String!
                ) {
                  createCreditCard(input: {
                    label: $label
                    cardHolder: $cardHolder
                    lastFourDigits: $lastFourDigits
                    expiration: $expiration
                    issuer: $issuer
                    status: $status
                    creditLimitAmount: $creditLimitAmount
                    creditLimitCurrencyId: $creditLimitCurrencyId
                  }) {
                    id
                    label
                    cardHolder
                    lastFourDigits
                    expiration
                    issuer
                    status
                    creditLimitAmount
                    creditLimitCurrency {
                      id
                      code
                    }
                  }
                }
            `,
            variables: {
                label,
                lastFourDigits,
                cardHolder,
                expiration,
                issuer,
                status,
                creditLimitAmount,
                creditLimitCurrencyId,
            },
        },
    })
    return response.data
}

export async function apiUpdateCreditCard(body: CreditCardInput): Promise<any> {
    const {
        id,
        label,
        lastFourDigits,
        cardHolder,
        expiration,
        issuer,
        status,
        creditLimitAmount,
        creditLimitCurrencyId,
    } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'updateCreditCard',
            query: `
                mutation updateCreditCard(
                    $id: String!
                    $label: String!
                    $lastFourDigits: String
                    $cardHolder: String
                    $expiration: String!
                    $issuer: CreditCardIssuer!
                    $status: CreditCardStatus!
                    $creditLimitAmount: Float!
                    $creditLimitCurrencyId: String!
                ) {
                  updateCreditCard(id: $id, input: {
                    label: $label
                    cardHolder: $cardHolder
                    lastFourDigits: $lastFourDigits
                    expiration: $expiration
                    issuer: $issuer
                    status: $status
                    creditLimitAmount: $creditLimitAmount
                    creditLimitCurrencyId: $creditLimitCurrencyId
                  }) {
                    id
                    label
                    cardHolder
                    lastFourDigits
                    expiration
                    issuer
                    status
                    creditLimitAmount
                    creditLimitCurrency {
                      id
                      code
                    }
                  }
                }
            `,
            variables: {
                id,
                label,
                lastFourDigits,
                cardHolder,
                expiration,
                issuer,
                status,
                creditLimitAmount,
                creditLimitCurrencyId,
            },
        },
    })
    return response.data
}

export async function apiDeleteCreditCard(
    creditCardId: string,
): Promise<boolean> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'deleteCreditCard',
            query: `mutation deleteCreditCard($id: String!) {
              deleteCreditCard(id: $id)
            }`,
            variables: {
                id: creditCardId,
            },
        },
    })
    return response.data
}

export async function apiCreateCreditCardMonthlyStatement(body: {
    creditCardId: string
    closeDate: string
}): Promise<any> {
    const { creditCardId, closeDate } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createCreditCardMonthlyStatement',
            query: `
                mutation createCreditCardMonthlyStatement(
                  $creditCardId: String!
                  $closeDate: String!
                ) {
                  createCreditCardMonthlyStatement(
                    creditCardId: $creditCardId, 
                    closeDate: $closeDate
                  ) {
                    id
                  }
                }
            `,
            variables: {
                creditCardId,
                closeDate,
            },
        },
    })
    return response.data
}
