// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();
export const getDefaultUserData = (): {email: string, password: string, name: string} => {
    return {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASS,
        name: process.env.TEST_USER_NAME,
    }
}
