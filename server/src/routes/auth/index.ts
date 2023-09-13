import { Static, Type } from '@sinclair/typebox';
import firebaseApp from '../../services/firebase';

export const User = Type.Object({
  id: Type.Readonly(Type.String()),
  name: Type.Required(Type.String()),
  email: Type.Required(Type.String({ format: 'email' })),
  avatar: Type.Readonly(Type.Union([
    Type.String(),
    Type.Null()
  ]))
})

export const UserRegistration = Type.Object({
  name: Type.Required(Type.String()),
  email: Type.Required(Type.String({ format: 'email' })),
  password: Type.Required(Type.String()),
})

export type UserType = Static<typeof User>
export type UserRegistrationType = Static<typeof UserRegistration>

const auth: any = async (fastify: any): Promise<void> => {
  fastify.post(
    '/sign-up', {
      schema: {
        body: UserRegistration,
        response: {
          200: User
        },
      },
    },
    async function (request: any, reply: any) {
      const {email, name, password} = request.body;
      const user = await firebaseApp.auth().createUser({
        email,
        displayName: name,
        password
      })
      reply.status(200).send({
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        avatar: user.photoURL || null
      })
    });
}

export default auth;
