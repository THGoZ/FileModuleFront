import { makeRequest } from "./common";
import type { ResponseData } from "./types";


export class AuthAPI {
    public static async login(email: string, password: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/users/login', 'POST', false, { email, password });
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }

    public static async register(email: string, password: string, name: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/users/register', 'POST', false, { email, password, name });
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };
}