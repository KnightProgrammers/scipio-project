import UserSchema from '@/models/user.model';

class UserService {
	static async findById(id: string): Promise<any> {
		return UserSchema.findById(id);
	}
	static async findByEmail(email: string): Promise<any> {
		return UserSchema.findOne({email});
	}
}

export default UserService;
