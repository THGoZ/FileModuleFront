import { UserRole } from "../src/constants/enums";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ImageData {
    id: string;
    path: string;
    description: string;
}

export interface SessionDetails {
    id: string;
    expire: string;
    userData: User;
}