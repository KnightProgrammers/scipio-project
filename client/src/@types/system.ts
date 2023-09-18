export type CountryDataType = {
    id: string
    name: string
}

export type UserDataType = {
    id: string
    name: string
    email: string
    avatar: string
    lang: string
    country: string
}

export type LanguageOption = {
    value: string
    label: string
    imgPath: string
}

export const langOptions: LanguageOption[] = [
    {
        value: 'en',
        label: 'English (US)',
        imgPath: '/img/countries/us.png',
    },
    {
        value: 'es',
        label: 'Español (Latinoamérica)',
        imgPath: '/img/countries/sp.png',
    },
]
