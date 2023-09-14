import { Static, Type } from "@sinclair/typebox";
import * as gavatar from "gravatar";
import firebaseApp from "@/services/firebase";
import UserSchema from "@/models/user.model";
import AuthMiddleware from "@/middlewares/auth.middleware";
export const User = Type.Object({
  id: Type.String(),
  name: Type.Required(Type.String()),
  email: Type.Required(Type.String({ format: 'email' })),
  avatar: Type.Readonly(Type.Union([
    Type.String(),
    Type.Null()
  ])),
  lang: Type.String()
})

export type UserType = Static<typeof User>

const users: any = async (fastify: any): Promise<void> => {
  fastify.decorateRequest('user', null);
  fastify.addHook('onRequest', AuthMiddleware);

  fastify.get(
    '/me', {
      schema: {
        response: {
          200: User
        },
      },
    },
    async function (request: any, reply: any) {
      let user = request.user;
      if (!user) {
        const authToken: string = (request.headers.authorization || '').split('Bearer ')[1];
        const decodedIdToken = await firebaseApp.auth().verifyIdToken(authToken);
        user = await UserSchema.create({
          name: decodedIdToken.name,
          email: decodedIdToken.email,
          firebaseId: decodedIdToken.uid,
          avatar: decodedIdToken.picture
        });
      }
      if (!user.avatar) {
        user.avatar = gavatar.url(user.email, {protocol: 'https', s: '100'});
        await user.save();
      }
      reply.status(200).send({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        lang: user.lang || null
      })
    });
  fastify.post(
    '/me', {
      schema: {
        body: User,
        response: {
          201: User
        },
      },
    },
    async function (request: any, reply: any) {
      let newData: UserType = request.body;
      console.log(newData);
      const user = request.user;
      user.name =  newData.name;
      user.lang = newData.lang;
      user.save();
      reply.status(201).send({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        lang: user.lang || null
      });
    }
  );
}

export default users;
