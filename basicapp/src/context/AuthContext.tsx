import { checkSession } from "@/api/appwrite/appwrite.api";
import type { ResponseData } from "@/api/types";
import type { User } from "@/interfaces/interfaces";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { jwtDecode } from "jwt-decode";
import { AuthAPI } from "@/api/auth.api";
import { decodeToken } from "@/utils/token.utils";

interface AuthState {
  token: string | null;
  tokenDetails: User | null;
  expire: string | null;
}

interface AuthContextType {
  token: string | null;
  tokenDetails: User | null;
  authState: AuthState;
  handleLogin: (email: string, password: string) => Promise<ResponseData<any>>;
  handleRegister: (
    email: string,
    password: string,
    name: string
  ) => Promise<ResponseData<any>>;
  validateSession: () => Promise<boolean>;
  clearAuth: () => void;
  checkValid: () => boolean;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) return { token: null, tokenDetails: null, expire: null };
    try {
      const decoded = decodeToken(storedToken);
      if (!decoded) return { token: null, tokenDetails: null, expire: null };
      return {
        token: storedToken,
        expire: decoded.exp,
        tokenDetails: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        },
      };
    } catch {
      localStorage.removeItem("authToken");
      return { token: null, tokenDetails: null, expire: null };
    }
  });

  const clearAuth = useCallback(() => {
    localStorage.removeItem("authToken");
    setAuthState({ token: null, tokenDetails: null, expire: null });
  }, []);

  /*   const handleLogin = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = await login(email, password);
      if (result) {
        localStorage.setItem("token", result.id);
        localStorage.setItem("expire", result.expire);
        localStorage.setItem("tokenDetails", JSON.stringify(result.userData)); // optional
        setAuthState({
          token: result.id,
          tokenDetails: result.userData,
          expire: result.expire,
        });
      }
      console.log(result);
      return result ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }; */

  const updateToken = useCallback(
    (newToken: string) => {
      try {
        const decoded: any = jwtDecode(newToken);
        console.log(decoded);
        localStorage.setItem("authToken", newToken);

        setAuthState({
          token: newToken,
          expire: decoded.exp,
          tokenDetails: {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
          },
        });
      } catch (error) {
        console.error("Token decoding error", error);
        clearAuth();
      }
    },
    [clearAuth]
  );

  const handleLogin = async (
    username: string,
    password: string
  ): Promise<ResponseData<any>> => {
    const response = await AuthAPI.login(username, password);
    console.log(response.data.id);
    if (response.statusCode === 200 && response.data.id) {
      updateToken(response.data.id);
    }
    return response;
  };

  const handleRegister = async (
    email: string,
    password: string,
    name: string
  ): Promise<ResponseData<any>> => {
    const response = await AuthAPI.register(email, password, name);
    if (response.statusCode === 200 && response.data.id) {
      updateToken(response.data.id);
    }
    return response;
  };

  const checkValid = useCallback((): boolean => {
    if (!authState.token) return false;

    try {
      const decodedToken: any = jwtDecode(authState.token);
      const currentTime = Math.floor(Date.now() / 1000);

      const isValid = decodedToken.exp && decodedToken.exp > currentTime;

      if (!isValid) {
        clearAuth();
      }

      return isValid;
    } catch (error) {
      console.error("Token validation error", error);
      clearAuth();
      return false;
    }
  }, [authState.token, clearAuth]);

  /*   const handleRegister = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const result = await signup(email, password, name);
      if (result) {
        await handleLogin(email, password);
      }
      return result ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }; */

  /*   const checkValid = () => {
    if (!authState.token || !authState.expire) {
      return false;
    }
    try {
      const valid = new Date(authState.expire) > new Date();
      return valid;
    } catch (err) {
      console.log(err);
      return false;
    }
  }; */

  const validateSession = async (): Promise<boolean> => {
    if (!authState.token) {
      return false;
    }
    try {
      const toValidate = await checkSession(authState.token as string);
      if (!toValidate) {
        clearAuth();
        return false;
      }
      if (authState.tokenDetails === null) {
        setAuthState({
          token: authState.token,
          tokenDetails: toValidate.userData,
          expire: toValidate.expire,
        });
      }
      return true;
    } catch (err) {
      console.log(err);
      clearAuth();
      return false;
    }
  };

  const logout = async () => {
    try {
      /* await deleteSession(authState.token as string); */
      return true;
    } catch (err) {
      console.log(err);
      return true;
    } finally {
      clearAuth();
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const toValidate = await checkSession(authState.token as string);
        if (toValidate) {
          setAuthState({
            token: authState.token,
            tokenDetails: toValidate.userData,
            expire: toValidate.expire,
          });
        }
      } catch (err) {
        console.log(err);
        clearAuth();
      }
    };
    const valid = checkValid();
    if (!valid && authState.token) {
      clearAuth();
    }
    if (authState.token && !authState.tokenDetails) {
      fetchSession();
    }
  }, []);

  useEffect(() => {
    console.log("authState", authState);
  }, [authState]);

  return (
    <AuthContext.Provider
      value={{
        tokenDetails: authState.tokenDetails,
        token: authState.token,
        authState,
        handleLogin,
        handleRegister,
        clearAuth,
        validateSession,
        checkValid,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
