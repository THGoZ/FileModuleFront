import { UserRole } from "@/constants/enums";
import { Account, AppwriteException, Client, Databases, ID, Query, Storage } from "appwrite";
import accountSetterHelper from "./helpers/accountSetter.helper";
import type { ImageData, SessionDetails, User } from "@/interfaces/interfaces";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID as string;
const IMAGES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_IMAGES_COLLECTION_ID as string;
const BUCKET_ID = import.meta.env.VITE_APPRWITE_BUCKET_ID as string;
const IMAGE_PREVIEW_BASE_URL = import.meta.env.VITE_APPWRITE_IMAGE_PREVIEW_BASE_URL as string;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT as string)
    .setProject(PROJECT_ID)

const database = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

export const signup = async (email: string, password: string, name: string): Promise<boolean | undefined> => {
    try {
        const result = await account.create(
            ID.unique(),
            email,
            password,
        );

        if (result) {
            const userData = await createUser(name, email, UserRole.USER, result.$id);
            return userData ? true : false;
        }

        return result ? true : false;
    }
    catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const login = async (email: string, password: string): Promise<SessionDetails | undefined> => {
    try {
        const result = await account.createEmailPasswordSession(
            email,
            password,
        );

        const userData = await getUser(result.userId);
        if (!userData) {
            throw new Error('No se pudo recuperar el usuario');
        }

        const session = accountSetterHelper.sessionDataCreate(result.expire, result.$id, userData);
        return session;
    }
    catch (err) {
        console.log(err);
        if (err instanceof AppwriteException) {
            if (err.type === 'user_invalid_credentials') {
                err.message = 'Correo o contraseña incorrectos';
                throw err as AppwriteException;
            }
            throw err as AppwriteException;
        }
    }
}

export const checkSession = async (SessionId: string): Promise<SessionDetails | undefined> => {
    try {
        const result = await account.getSession(SessionId);

        const userData = await getUser(result.userId);
        if (!userData) {
            throw new Error('No se pudo recuperar el usuario');
        }

        const session = accountSetterHelper.sessionDataCreate(result.expire, result.$id, userData);
        return session;

    } catch (err) {
        if (err instanceof AppwriteException) {
            if (err.type === 'general_unauthorized_scope') {
                err.message = 'Sesión caducada. Por favor, inicie sesión nuevamente.';
                throw err as AppwriteException;
            }
            throw err as AppwriteException;
        } else {
            console.error('Unexpected Error:', err);
            throw err;
        }
    }
};

export const deleteSession = async (SessionId: string) => {
    try {
        const result = await account.deleteSession(SessionId);
        return result ? true : false;
    } catch (err) {
        if (err instanceof AppwriteException) {
            if (err.type === 'general_unauthorized_scope') {
                err.message = 'Sesión caducada. Por favor, inicie sesión nuevamente.';
                throw err as AppwriteException;
            }
            throw err as AppwriteException;
        } else {
            console.error('Unexpected Error:', err);
            throw err;
        }
    }
}

export const createUser = async (name: string, email: string, role: UserRole, id: string): Promise<User | undefined> => {
    try {
        const user = await database.createDocument(DATABASE_ID, USERS_COLLECTION_ID, ID.unique(), {
            name,
            email,
            role,
            id,
        });

        const userData: User = {
            id: id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        return userData;

    } catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const getUser = async (id: string): Promise<User | undefined> => {
    try {
        const users = await database.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
            Query.equal('id', id),
        ]);

        if (users.documents.length > 0) {
            const user = users.documents[0];

            const userData: User = {
                id: id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
            return userData;
        }
    } catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const uploadImage = async (file: File): Promise<string | undefined> => {
    try {
        const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
        return result.$id;
    } catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const getImagePreview = (id: string) => {
    try {
        const result = storage.getFilePreview(BUCKET_ID, id);
        return result;
    } catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const saveUserImage = async (id: string, path: string, description = ""): Promise<boolean | undefined> => {
    try {
        const result = await database.createDocument(DATABASE_ID, IMAGES_COLLECTION_ID, ID.unique(), { id, path, description });
        return result ? true : false;
    } catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const getUserImages = async (id: string): Promise<string[] | undefined> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, IMAGES_COLLECTION_ID, [
            Query.equal('userId', id),
        ]);
        return result.documents.map((image) => image.path);
    } catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const getAllImages = async (orderBy = "$createdAt", orderType = "desc", searchterm = "", userId = ""): Promise<ImageData[] | undefined> => {
    try {

        const query = []

        if (searchterm.trim()) {
            query.push(Query.contains('description', searchterm));
        }

        if (orderType === 'asc') {
            query.push(Query.orderAsc(orderBy));
        } else {
            query.push(Query.orderDesc(orderBy));
        }

        if (userId.trim()) {
            query.push(Query.equal('id', userId));
        }

        const result = await database.listDocuments(DATABASE_ID, IMAGES_COLLECTION_ID, query);
        return result.documents.map((image) => {
            return {
                id: image.$id,
                path: `${IMAGE_PREVIEW_BASE_URL}${BUCKET_ID}/files/${image.path}/view?project=${PROJECT_ID}`,
                description: image.description,
            };
        });
    } catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const deleteImage = async (id: string) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, IMAGES_COLLECTION_ID, [
            Query.equal("$id", id),
        ]);
        const deleted = await database.deleteDocument(DATABASE_ID, IMAGES_COLLECTION_ID, result.documents[0].$id);
        return deleted ? true : false;
    }
    catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export const updateImage = async (id: string, path?: string, description?: string) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, IMAGES_COLLECTION_ID, [
            Query.equal("$id", id),
        ]);

        if (result.documents.length === 0) {
            throw new Error('No se pudo encontrar la imagen');
        }

        const data = {
            path: path ?? result.documents[0].path,
            description: description ?? result.documents[0].description,
        };

        const edited = await database.updateDocument(DATABASE_ID, IMAGES_COLLECTION_ID, id, data);
        return edited ? true : false;
    } catch (err) {
        console.log(err);
        throw err as AppwriteException;
    }
}

export default client;