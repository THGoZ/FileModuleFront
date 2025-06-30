import type { ResponseData } from "@/api/types";
import { UsersAPI } from "@/api/users.api";
import type { SortOption } from "@/components/sortSelectInput";
import type { UserRole } from "@/constants/enums";
import type { PagedList, User } from "@/interfaces/interfaces";
import { createContext, useContext, useState, useCallback, useMemo } from "react";

interface UsersContextType {
  users: PagedList<User>;
  isLoading: boolean;
  getUsers: (
    page?: number,
    pageSize?: number,
    role?: UserRole,
    search?: string,
    sortBy?: SortOption
  ) => Promise<ResponseData<any>>;
  deleteUser: (id: string) => Promise<ResponseData<any>>;
  updateUser: (
    id: string,
    email?: string,
    name?: string
  ) => Promise<ResponseData<any>>;
  addUser: (
    email: string,
    name: string,
    password: string
  ) => Promise<ResponseData<any>>;
  deleteUsersBulk: (ids: number[]) => Promise<ResponseData<any>>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<PagedList<User>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 5,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getUsers = useCallback(async (
    page = 1,
    pageSize = 5,
    role = "user" as UserRole,
    search?: string,
    sortBy?: SortOption
  ): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);

      const queryParams: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString(),
        role: role,
      };

      if (search) queryParams.search = search;
      if (sortBy) {
        queryParams.sortBy = sortBy.key;
        queryParams.sortOrder = sortBy.direction;
      }

      const response = await UsersAPI.getUsers(queryParams);
      if (response.statusCode === 200) {
        setUsers(response.responseData.data);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      return await UsersAPI.deleteUser(id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (
    id: string,
    name?: string,
    email?: string
  ): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      return await UsersAPI.updateUser(id, name, email);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUser = useCallback(async (
    email: string,
    name: string,
    password: string
  ): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      return await UsersAPI.addUser(email, name, password);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUsersBulk = useCallback(async (ids: number[]): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      return await UsersAPI.deleteUsersBulk(ids);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      users,
      isLoading,
      getUsers,
      deleteUser,
      updateUser,
      addUser,
      deleteUsersBulk,
    }),
    [users, isLoading, getUsers, deleteUser, updateUser, addUser, deleteUsersBulk]
  );

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within an UsersProvider");
  }
  return context;
};
