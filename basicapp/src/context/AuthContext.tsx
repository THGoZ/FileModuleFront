import {
  checkSession,
  deleteSession,
  login,
  signup,
} from "@/api/appwrite/appwrite.api";
import type { User } from "@/interfaces/interfaces";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthState {
  token: string | null;
  tokenDetails: User | null;
  expire: string | null;
}

interface AuthContextType {
  token: string | null;
  tokenDetails: User | null;
  authState: AuthState;
  handleLogin: (email: string, password: string) => Promise<boolean>;
  handleRegister: (
    email: string,
    password: string,
    name: string
  ) => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  clearAuth: () => void;
  checkValid: () => boolean;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const storedToken = localStorage.getItem("token");
    const storedExpire = localStorage.getItem("expire");
    const storedDetails = localStorage.getItem("tokenDetails");

    return {
      token: storedToken,
      expire: storedExpire,
      tokenDetails: storedDetails ? JSON.parse(storedDetails) : null,
    };
  });

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("expire");
    localStorage.removeItem("tokenDetails");
    setAuthState({ token: null, tokenDetails: null, expire: null });
  }, []);

  const handleLogin = async (
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
  };

  const handleRegister = async (
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
  };

  const checkValid = () => {
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
  };

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
      await deleteSession(authState.token as string);
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
