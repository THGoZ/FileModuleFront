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

    public static async updateUser(id: string, name?: string, email?: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/${id}`, 'PUT', true, { name, email });
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async updatePassword(id: string, password: string, newPassword: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/${id}/password`, 'PATCH', true, {id, password, newPassword });
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async deleteUser(id: string, password: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/${id}`, 'DELETE', true, {id, password });
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };
}