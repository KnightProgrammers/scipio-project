import { Server } from 'miragejs'

export default function accountFakeApi(server: Server, apiPrefix: string) {
    server.get(`${apiPrefix}/account/setting`, (schema) => {
        const data = schema.db.signInUserData[0]
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            lang: data.lang,
        }
    })
}
