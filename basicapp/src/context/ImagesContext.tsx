import { createContext, useContext, useState } from "react";
import {
  uploadImage as appwriteUploadImage,
  saveUserImage,
  getAllImages as appwriteGetAllImages,
  getImagePreview as appwriteGetImagePreview,
  deleteImage as appwriteDeleteImage,
  updateImage as appwriteUpdateImage,
} from "@/api/appwrite/appwrite.api";
import type { ImageData } from "@/interfaces/interfaces";

interface ImagesContextType {
  uploadImage: (
    userId: string,
    file: File,
    file_name: string,
    description: string
  ) => Promise<boolean>;
  getAllImages: (
    orderBy?: string,
    orderType?: string,
    searchterm?: string,
    userId?: string
  ) => Promise<void>;
  getImagePreview: (id: string) => string | undefined;
  deleteImage: (id: string) => Promise<boolean>;
  editImage: (
    id: string,
    path?: string,
    description?: string
  ) => Promise<boolean>;
  deleteMany: (ids: string[]) => Promise<boolean>;
  images: ImageData[];
  isLoading: boolean;
}

const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

export const ImagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const uploadImage = async (
    userId: string,
    file: File,
    file_name: string,
    description: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const imageUploaded = await appwriteUploadImage(file);
      if (imageUploaded) {
        const result = await saveUserImage(userId, imageUploaded, description);
        await getAllImages();
        return result ? true : false;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllImages = async (
    orderBy = "$createdAt",
    orderType = "desc",
    searchterm = "",
    userId = ""
  ) => {
    try {
      setIsLoading(true);
      const result = await appwriteGetAllImages(
        orderBy,
        orderType,
        searchterm,
        userId
      );
      setImages(result ?? []);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getImagePreview = (id: string) => {
    try {
      setIsLoading(true);
      const result = appwriteGetImagePreview(id);
      return result;
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await appwriteDeleteImage(id);
      await getAllImages();
      return result ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMany = async (ids: string[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      ids.forEach(async (id) => {
        await appwriteDeleteImage(id);
      });
      await getAllImages();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const editImage = async (id: string, path?: string, description?: string) => {
    try {
      setIsLoading(true);
      const result = await appwriteUpdateImage(id, path, description);
      await getAllImages();
      return result ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImagesContext.Provider
      value={{
        uploadImage,
        getAllImages,
        getImagePreview,
        deleteImage,
        editImage,
        deleteMany,
        images,
        isLoading,
      }}
    >
      {children}
    </ImagesContext.Provider>
  );
};

export const useImages = (): ImagesContextType => {
  const context = useContext(ImagesContext);
  if (context === undefined) {
    throw new Error("useImages must be used within an ImagesProvider");
  }
  return context;
};
