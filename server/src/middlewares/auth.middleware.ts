import firebaseApp from '@/services/firebase.service';
import UserSchema from '@/models/user.model';
import mercurius from 'mercurius';


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
			return user.toObject();
		} catch (e) {
			const error = new mercurius.ErrorWithProps('Token Expired');
			error.statusCode = 401;
			throw error;
		}
	}
	const error = new mercurius.ErrorWithProps('Access Denied');
	error.statusCode = 403;
	throw error;
};
