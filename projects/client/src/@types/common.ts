import { ReactNode, CSSProperties } from 'react'

export interface CommonProps {
    className?: string
    'data-tn'?: string
    children?: ReactNode
    style?: CSSProperties
}

export type TableQueries = {
    total?: number
    pageIndex?: number
    pageSize?: number
    query?: string
    sort?: {
        order: 'asc' | 'desc' | ''
        key: string | number
    }
}

export interface SelectOption {
    label: string
    value: string
}
