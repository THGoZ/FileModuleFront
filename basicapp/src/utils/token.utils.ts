import { jwtDecode } from "jwt-decode";
import type { UserRole } from "@/constants/enums";

export interface TokenPayload {
  id: string;
  exp: string;
  email: string;
  name: string;
  role: UserRole;
}

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};
