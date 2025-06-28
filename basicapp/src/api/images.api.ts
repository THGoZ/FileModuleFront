import { makeRequest } from "./common";
import type { ResponseData } from "./types";

export class ImagesAPI {

    public static async uploadImage(imageData: FormData): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/documents/image', 'POST', false, undefined, imageData);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };

    public static async getAllImages(queryParams?: Record<string, string>): Promise<ResponseData<any>> {
        try {
            const response = await makeRequest('/documents/images', 'GET', false, undefined, undefined, queryParams);
            return response;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    };
}