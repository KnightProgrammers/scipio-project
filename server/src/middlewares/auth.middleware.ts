import firebaseApp from "../services/firebase";
import UserSchema from "../models/user.model";

export default async (request: any, reply: any) => {
  const {authorization} = request.headers;
  if (!!authorization && authorization.startsWith('Bearer ')) {
    const authToken: string = authorization.split('Bearer ')[1];
    try {
      const decodedIdToken = await firebaseApp.auth().verifyIdToken(authToken);
      request.user = await UserSchema.findOne({ firebaseId: decodedIdToken.uid });
      return;
    } catch (e) {
      reply.status(401).send({
        error: 401,
        code: 'tokenExpired',
        message: 'Token Expired',
      });
    }
  }
  reply.status(403).send({
    error: 403,
    code: 'accessDenied',
    message: 'Access Denied',
    headers: request.headers.authorization
  });
}
