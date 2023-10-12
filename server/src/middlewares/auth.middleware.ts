import firebaseApp from "@/services/firebase.service";
import UserSchema from "@/models/user.model";

export default async (request: any, reply: any) => {
	const { authorization } = request.headers;
	try {
		request.user = await authenticateUser(authorization);
		return;
	} catch (e: any) {
		reply.status(e.status || 403).send({
			error: e.status,
			code: e.code,
			message: e.message
		});
	}
};

export const authenticateUser = async (authorization: string) => {
	if (!!authorization && authorization.startsWith('Bearer ')) {
		const authToken: string = authorization.split('Bearer ')[1];
		try {
			const decodedIdToken = await firebaseApp
				.auth()
				.verifyIdToken(authToken);

			let user = await UserSchema.findOne({
					firebaseId: decodedIdToken.uid,
				});
			if (!user) {
				user = await UserSchema.create({
					name: decodedIdToken.name,
					email: decodedIdToken.email,
					firebaseId: decodedIdToken.uid,
					avatar: decodedIdToken.picture,
				});
			}
			return user;
		} catch (e) {
			const error: any = new Error('Token Expired');
			error.status = 401;
			error.code = 'tokenExpired';
			throw error;
		}
	}
	const error: any = new Error('Access Denied');
	error.status = 403;
	error.code = 'accessDenied';
	throw error;
}
