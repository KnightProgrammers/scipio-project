import { Static, Type } from '@sinclair/typebox';
import firebaseApp from '@/services/firebase.service';
import CountryModel from "@/models/country.model";
import UserSchema from "@/models/user.model";
import { User } from "@/@types/user.type";


export const UserRegistration = Type.Object({
  name: Type.Required(Type.String()),
  email: Type.Required(Type.String({ format: 'email' })),
  password: Type.Required(Type.String()),
  country: Type.Required(Type.String()),
  lang: Type.Required(Type.String()),
})

export type UserRegistrationType = Static<typeof UserRegistration>

const auth: any = async (fastify: any): Promise<void> => {
  fastify.post(
    '/sign-up', {
      schema: {
        body: UserRegistration,
        response: {
          201: User
        },
      },
    },
    async function (request: any, reply: any) {
      const {email, name, password, country: countryName, lang} = request.body;
      const country = await CountryModel.findOne({name: countryName})
      const firebaseUser = await firebaseApp.auth().createUser({
        email,
        displayName: name,
        password
      })
      const user = await UserSchema.create({
        name,
        email,
        firebaseId: firebaseUser.uid,
        avatar: firebaseUser.photoURL || null,
        country,
        lang
      });
      reply.status(201).send({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || null,
        lang: user.lang,
        country: user.country ? user.country.name : null
      })
    });
}

export default auth;
