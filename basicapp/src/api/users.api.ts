import { makeRequest } from "./common";
import type { ResponseData } from "./types";

export class UsersAPI {
    public static async getUsers(queryParams?: Record<string, string>): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/users/admin', 'GET', true, undefined, undefined, queryParams);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async getUser(id: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/${id}`, 'GET', true);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async updateUser(id: string, name?: string, email?: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/admin/${id}`, 'PATCH', true, { name, email });
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async deleteUser(id: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/admin/${id}`, 'DELETE', true);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async deleteUsersBulk(ids: number[]): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/admin/bulk`, 'DELETE', true, { ids });
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async addUser(email: string, name: string, password: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/users/admin', 'POST', true, { name, email, password });
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };
}