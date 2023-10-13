import UserSchema from "@/models/user.model";

class UserService {
  static async findById(id: string): Promise<any> {
      return UserSchema.findById(id);
  }
}

export default UserService;
