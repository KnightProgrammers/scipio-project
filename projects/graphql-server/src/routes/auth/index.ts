import { Type } from '@sinclair/typebox';
import firebaseApp from '@/services/firebase.service';
import UserSchema from '@/models/user.model';
import { EmailQueue } from '@/queues/email.queue';
import i18n from "@/locales";
import UserService from "@/services/user.service";

export const ForgotPasswordBody = Type.Object({
	email: Type.Required(Type.String({ format: 'email' })),
	baseUrl: Type.Required(Type.String()),
});

export const UserRegistration = Type.Object({
	name: Type.Required(Type.String()),
	email: Type.Required(Type.String({ format: 'email' })),
	password: Type.Required(Type.String()),
});

const User = Type.Object({
	id: Type.Readonly(Type.String()),
	name: Type.Required(Type.String()),
	email: Type.Required(Type.String({ format: 'email' })),
	avatar: Type.Readonly(Type.Union([Type.String(), Type.Null()])),
	country: Type.Required(Type.String()),
});

const auth: any = async (fastify: any): Promise<void> => {
	fastify.post(
		'/sign-up',
		{
			schema: {
				body: UserRegistration,
				response: {
					201: User,
				},
			},
		},
		async function (request: any, reply: any) {
			const {
				email,
				name,
				password,
			} = request.body;
			const firebaseUser = await firebaseApp.auth().createUser({
				email,
				displayName: name,
				password,
			});
			const user = await UserSchema.create({
				name,
				email,
				firebaseId: firebaseUser.uid,
				avatar: firebaseUser.photoURL || null
			});
			reply.status(201).send({
				id: user.id,
				name: user.name || '',
				email: user.email || '',
				avatar: user.avatar || null,
				lang: null,
				country: null,
			});
		},
	);
	fastify.post(
		'/forgot-password',
		{
			schema: {
				body: ForgotPasswordBody,
				response: {
					204: {},
				},
			},
		},
		async function (request: any, reply: any){
			const {
				email,
				baseUrl
			} = request.body;
			const user = await UserService.findByEmail(email);
			if (!user) {
				reply.status(204).send();
			}
			try {
				const passwordResetLink = await firebaseApp.auth().generatePasswordResetLink(email);
				const passwordResetUrl = new URL(passwordResetLink);
				const redirectionUrl = new URL(baseUrl);
				redirectionUrl.pathname = '/reset-password';
				redirectionUrl.search = passwordResetUrl.search;
				await i18n.changeLanguage(user.lang || 'en');
				await EmailQueue.sendEmail({
					type: 'reset-password-email',
					recipients: email,
					subject: i18n.t('emails.forgotPassword.subject'),
					fields: {
						title: i18n.t('emails.forgotPassword.title'),
						description: i18n.t('emails.forgotPassword.description'),
						label_cta: i18n.t('emails.forgotPassword.labelCta'),
						link_cta: redirectionUrl.toString()
					}
				});
			} finally {
				reply.status(204).send();
			}
		}
	);
};

export default auth;
