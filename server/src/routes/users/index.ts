import { Static, Type } from '@sinclair/typebox';
import * as gavatar from "gravatar";
import firebaseApp from '../../services/firebase';
import UserSchema from '../../models/user.model';


export const User = Type.Object({
  id: Type.Readonly(Type.String()),
  name: Type.Required(Type.String()),
  email: Type.Required(Type.String({ format: 'email' })),
  avatar: Type.Readonly(Type.Union([
    Type.String(),
    Type.Null()
  ]))
})

export type UserType = Static<typeof User>

const users: any = async (fastify: any): Promise<void> => {
  fastify.get(
    '/me', {
      schema: {
        response: {
          200: User
        },
      },
    },
    async function (request: any, reply: any) {
      const authToken: string = (request.headers.authorization || '').split('Bearer ')[1];
      const decodedIdToken = await firebaseApp.auth().verifyIdToken(authToken);
      let user = await UserSchema.findOne({firebaseId: decodedIdToken.uid});
      if (!user) {
        user = await UserSchema.create({
          name: decodedIdToken.name,
          email: decodedIdToken.email,
          firebaseId: decodedIdToken.uid
        });
      }
      if (!user.avatar && decodedIdToken.picture) {
        user.avatar = decodedIdToken.picture;
      }
      if (!user.avatar && !decodedIdToken.picture) {
        user.avatar = gavatar.url(user.email, {protocol: 'https', s: '100'});
        await user.save();
      }
      reply.status(200).send({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null
      })
    });
}

export default users;
