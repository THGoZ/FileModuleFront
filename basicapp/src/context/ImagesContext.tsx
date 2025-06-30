import { createContext, useContext, useState } from "react";
import {
  getImagePreview as appwriteGetImagePreview,
  updateImage as appwriteUpdateImage,
} from "@/api/appwrite/appwrite.api";
import type { ImageData, PagedList } from "@/interfaces/interfaces";
import type { SortOption } from "@/components/sortSelectInput";
import { ImagesAPI } from "@/api/images.api";
import type { ResponseData } from "@/api/types";
import { DocumentsAPI } from "@/api/documents.api";

interface ImagesContextType {
  uploadImage: (imageData: FormData) => Promise<ResponseData<any>>;
  updateImage: (
    id: number,
    file_name: string,
    description: string
  ) => Promise<ResponseData<any>>;
  getAllImages: (
    page?: number,
    searchTerm?: string,
    sortBy?: SortOption,
    user_id?: string,
    pageSize?: number,
    include_user?: boolean
  ) => Promise<ResponseData<any>>;
  getImagePreview: (id: string) => string | undefined;
  deleteImage: (id: number) => Promise<ResponseData<any>>;
  editImage: (
    id: string,
    path?: string,
    description?: string
  ) => Promise<boolean>;
  bulkDeleteImages: (ids: number[]) => Promise<ResponseData<any>>;
  images: PagedList<ImageData>;
  isLoading: boolean;
}

const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

export const ImagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [images, setImages] = useState<PagedList<ImageData>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 5,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const uploadImage = async (imageData: FormData) => {
    setIsLoading(true);
    try {
      const response = await ImagesAPI.uploadImage(imageData);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const updateImage = async (
    id: number,
    file_name: string,
    description: string
  ) => {
    try {
      setIsLoading(true);
      const response = await DocumentsAPI.updateDocument(
        id.toString(),
        file_name,
        description
      );
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllImages = async (
    page = 1,
    searchTerm?: string,
    sortBy?: SortOption,
    user_id?: string,
    pageSize = 5,
    include_user = false
  ) => {
    try {
      setIsLoading(true);
      const queryParams: Record<string, string> = {};

      queryParams.page = page.toString();

      queryParams.pageSize = pageSize.toString();

      queryParams.include_user = include_user.toString();

      if (searchTerm) {
        queryParams.search = searchTerm;
      }
      if (sortBy) {
        queryParams.sortBy = sortBy.key;
        queryParams.sortOrder = sortBy.direction;
      }
      if (user_id) {
        queryParams.user_id = user_id;
      }

      const response = await ImagesAPI.getAllImages(queryParams);
      if (response.statusCode === 200) {
        setImages(response.responseData.data);
      }
      return response;
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

  const deleteImage = async (id: number): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      const result = await DocumentsAPI.deleteDocument(id.toString());
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteImages = async (
    ids: number[]
  ): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      const result = await DocumentsAPI.bulkDeleteDocuments(ids);
      return result;
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
        updateImage,
        getAllImages,
        getImagePreview,
        deleteImage,
        editImage,
        bulkDeleteImages,
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
