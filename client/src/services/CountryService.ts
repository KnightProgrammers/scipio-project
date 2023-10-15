import BaseService from '@/services/BaseService'

export async function apiGetCountryList() {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'countries',
            query: `query countries { countries { id code name } }`,
            variables: {},
        },
    })
    return response.data.data.countries
}
