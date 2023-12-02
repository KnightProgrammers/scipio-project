export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    token: string
    user: {
        id: string
        name: string
        avatar: string
        email: string
        lang: string
    }
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    name: string
    email: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}
