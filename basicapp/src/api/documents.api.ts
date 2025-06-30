import { makeRequest } from "./common";
import type { ResponseData } from "./types";

export class DocumentsAPI {
    public static async uploadDocument(document : FormData): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/documents/upload', 'POST', true, undefined, document);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }

    public static async deleteDocument(id : string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/documents/${id}`, 'DELETE', true);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async bulkDeleteDocuments(ids: number[]): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/documents/bulk`, 'DELETE', true, {ids});
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async getAllDocuments(queryParams?: Record<string, string>): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/documents', 'GET', false, undefined, undefined, queryParams);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async updateDocument(id : string, file_name : string, description : string): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest(`/documents/${id}`, 'PATCH', true, {file_name, description});
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };
}