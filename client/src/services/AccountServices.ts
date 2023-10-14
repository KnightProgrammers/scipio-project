import BaseService from '@/services/BaseService'
import { CurrencyDataType, UserDataType } from '@/@types/system'

export async function apiGetUserProfile(): Promise<UserDataType> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'currentUserInfo',
            query: `query currentUserInfo { me { id name email avatar lang country { id code name } } }`,
            variables: {},
        },
    })
    return response.data.data.me
}

export async function apiUpdateUserProfile(data: {
    name: string
    lang: string
    countryName: string
}): Promise<UserDataType> {
    const { name, lang, countryName } = data
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'updateUserProfile',
            query: `
                mutation updateUserProfile(
                  $name: String!
                  $lang: Lang!
                  $countryName: String!
                ) {
                  updateProfile(
                    name: $name
                    lang: $lang
                    countryName: $countryName
                  ) {
                    id
                    name
                    email
                    avatar
                    lang
                    country {
                      id
                      code
                      name
                    }
                  }
                }
            `,
            variables: {
                name,
                lang,
                countryName,
            },
        },
    })
    return response.data.data.updateProfile
}

export async function apiGetUserCurrencies(): Promise<CurrencyDataType[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userCurrencies',
            query: `query userCurrencies { me { id currencies { id code } } }`,
            variables: {},
        },
    })
    return response.data.data.me.currencies
}

export async function apiSetUserCurrencies(
    currencyIds: string[],
): Promise<CurrencyDataType[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'setUserCurrencies',
            query: `
                mutation setUserCurrencies(
                  $currencyIds: [String!]!
                ) {
                  setUserCurrencies(
                    currencyIds: $currencyIds
                  ) {
                    id
                  }
                }
            `,
            variables: {
                currencyIds,
            },
        },
    })
    return response.data.data.setUserCurrencies
}
