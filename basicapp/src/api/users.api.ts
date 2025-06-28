import { makeRequest } from "./common";
import type { ResponseData } from "./types";

export class UsersAPI {
    public static async getUsers(queryParams?: Record<string, string>): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/users', 'GET', false, undefined, undefined, queryParams);
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

    public static async updateUser(id: string, email?: string, name?: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/${id}`, 'PUT', false, {email, name});
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async deleteUser(id: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/${id}`, 'DELETE', false);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async deleteUsersBulk(ids: number[]): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/users/bulk`, 'DELETE', false, {ids});
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async addUser(email: string, name: string, password: string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/users', 'POST', false, {email, name, password});
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };
}