import type { ResponseData } from "@/api/types";
import { UsersAPI } from "@/api/users.api";
import type { SortOption } from "@/components/sortSelectInput";
import type { UserRole } from "@/constants/enums";
import type { UserList } from "@/interfaces/interfaces";
import { createContext, useContext, useState } from "react";

interface UsersContextType {
  users: UserList;
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
  const [users, setUsers] = useState<UserList>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 5,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getUsers = async (
    page = 1,
    pageSize = 5,
    role = "user" as UserRole,
    search?: string,
    sortBy?: SortOption
  ) => {
    try {
      setIsLoading(true);

      const queryParams: Record<string, string> = {};

      queryParams.page = page.toString();

      queryParams.pageSize = pageSize.toString();

      queryParams.role = role;

      if (search) {
        queryParams.search = search;
      }
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
  };

  const deleteUser = async (id: string): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      const result = await UsersAPI.deleteUser(id);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (
    id: string,
    email?: string,
    name?: string
  ): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      const result = await UsersAPI.updateUser(id, email, name);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (
    email: string,
    name: string,
    password: string
  ): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      const result = await UsersAPI.addUser(email, name, password);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUsersBulk = async (ids: number[]): Promise<ResponseData<any>> => {
    try {
      setIsLoading(true);
      const result = await UsersAPI.deleteUsersBulk(ids);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        isLoading,
        getUsers,
        deleteUser,
        updateUser,
        addUser,
        deleteUsersBulk,
      }}
    >
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
