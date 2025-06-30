import { UserRole } from "../src/constants/enums";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ImageData {
    id: number;
    user_id: number;
    path: string;
    description?: string;
    file_type: string;
    file_name: string;
    created_at: Date;
    userData?: User;
}

export interface SessionDetails {
  id: string;
  expire: string;
  userData: User;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface UserDocument{
    id: number;
    user_id: number;
    path: string;
    description?: string;
    file_type: string;
    file_name: string;
    created_at: Date;
    userData?: User;
}

export interface PagedList<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface updatePassword {
  newPassword: string;
  confirmPassword: string;
  password: string;
}

export interface deleteUser {
  password: string;
}