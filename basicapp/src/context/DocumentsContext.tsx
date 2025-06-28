import { DocumentsAPI } from "@/api/documents.api";
import type { ResponseData } from "@/api/types";
import type { SortOption } from "@/components/sortSelectInput";
import type { DocumentList } from "@/interfaces/interfaces";
import { createContext, useContext, useState } from "react";

interface DocumentsContextType {
  uploadDocument: (document: FormData) => Promise<ResponseData<any>>;
  deleteDocument: (id: number) => Promise<ResponseData<any>>;
  bulkDeleteDocuments: (ids: number[]) => Promise<ResponseData<any>>;
  getAllDocuments: (
    page?: number,
    searchTerm?: string,
    sortBy?: SortOption,
    user_id?: string,
    pageSize?: number,
    include_user?: boolean
  ) => Promise<ResponseData<any>>;
  updateDocument: (
    id: number,
    file_name: string,
    description: string
  ) => Promise<ResponseData<any>>;
  documents: DocumentList;
  isLoading: boolean;
}

export const DocumentsContext = createContext<DocumentsContextType | undefined>(
  undefined
);

export const DocumentsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [documents, setDocuments] = useState<DocumentList>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 5,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const uploadDocument = async (document: FormData) => {
    setIsLoading(true);
    const response = await DocumentsAPI.uploadDocument(document);
    if (response.statusCode === 200) {
      await getAllDocuments();
    }
    setIsLoading(false);
    return response;
  };

  const deleteDocument = async (id: number) => {
    try {
      setIsLoading(true);
      const result = await DocumentsAPI.deleteDocument(id.toString());
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteDocuments = async (ids: number[]) => {
    try {
      setIsLoading(true);
      const result = await DocumentsAPI.bulkDeleteDocuments(ids);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllDocuments = async (
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

      const response = await DocumentsAPI.getAllDocuments(queryParams);
      if (response.statusCode === 200) {
        setDocuments(response.responseData.data);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = async (
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

  return (
    <DocumentsContext.Provider
      value={{
        uploadDocument,
        deleteDocument,
        bulkDeleteDocuments,
        getAllDocuments,
        updateDocument,
        documents,
        isLoading,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
};

export const useDocuments = (): DocumentsContextType => {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within an DocumentsProvider");
  }
  return context;
};
