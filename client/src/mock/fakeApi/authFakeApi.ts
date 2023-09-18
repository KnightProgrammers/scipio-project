import { Server, Response } from 'miragejs'
import uniqueId from 'lodash/uniqueId'
import isEmpty from 'lodash/isEmpty'

export default function authFakeApi(server: Server, apiPrefix: string) {
    server.post(`${apiPrefix}/sign-in`, (schema, { requestBody }) => {
        const { email, password } = JSON.parse(requestBody)
        const user = schema.db.signInUserData.findBy({
            email,
            password,
        })
        if (user) {
            const { id, avatar, name, email, lang } = user
            return {
                user: { id, avatar, name, email, lang },
                token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
            }
        }
        return new Response(
            401,
            { some: 'header' },
            { message: 'Invalid email or password!' },
        )
    })

    server.post(`${apiPrefix}/sign-out`, () => {
        return true
    })

    server.post(`${apiPrefix}/sign-up`, (schema, { requestBody }) => {
        const { name, password, email, lang } = JSON.parse(requestBody)
        const emailUsed = schema.db.signInUserData.findBy({ email })
        const newUser = {
            avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
            name,
            email,
            lang,
        }
        if (!isEmpty(emailUsed)) {
            const errors = [
                { message: '', domain: 'global', reason: 'invalid' },
            ]
            return new Response(
                400,
                { some: 'header' },
                { errors, message: 'Email already used' },
            )
        }

        const insertedUser = schema.db.signInUserData.insert({
            ...newUser,
            ...{ id: uniqueId('user_'), password },
        })

        return {
            user: { ...newUser, id: insertedUser.id },
            token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
        }
    })

    server.post(`${apiPrefix}/forgot-password`, () => {
        return true
    })

    server.post(`${apiPrefix}/reset-password`, () => {
        return true
    })
}
