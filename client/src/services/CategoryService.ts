import { CategoryDataType } from '@/@types/system'
import BaseService from '@/services/BaseService'

export async function apiGetCategoryList(): Promise<CategoryDataType[]> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userCategories',
            query: `query userCategories { me { id categories { id name type isFixedPayment } } }`,
            variables: {},
        },
    })
    return response.data.data.me.categories
}

export async function apiCreateCategory(body: {
    name: string
    type: 'NEED' | 'WANT' | 'SAVE'
    isFixedPayment: boolean
}): Promise<CategoryDataType> {
    const { name, type, isFixedPayment } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createCategory',
            query: `
                mutation createCategory(
                    $name: String!
                    $type: CategoryType!
                    $isFixedPayment: Boolean!
                ) {
                  createCategory(input: {
                    name: $name
                    type: $type
                    isFixedPayment: $isFixedPayment
                  }) {
                    id
                    name
                    type
                    isFixedPayment
                  }
                }
            `,
            variables: {
                name,
                type,
                isFixedPayment,
            },
        },
    })
    return response.data
}

export async function apiUpdateCategory(
    body: CategoryDataType,
): Promise<CategoryDataType> {
    const { id, name, type, isFixedPayment } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'updateCategory',
            query: `
                mutation updateCategory(
                    $id: String!
                    $name: String!
                    $type: CategoryType!
                    $isFixedPayment: Boolean!
                ) {
                  updateCategory(id: $id, input: {
                    name: $name
                    type: $type
                    isFixedPayment: $isFixedPayment
                  }) {
                    id
                    name
                    type
                    isFixedPayment
                  }
                }
            `,
            variables: {
                id,
                name,
                type,
                isFixedPayment,
            },
        },
    })
    return response.data
}

export async function apiDeleteCategory(
    categoryId: string,
): Promise<CategoryDataType> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'deleteCategory',
            query: `mutation deleteCategory($id: String!) {
              deleteCategory(id: $id)
            }`,
            variables: {
                id: categoryId,
            },
        },
    })
    return response.data
}
