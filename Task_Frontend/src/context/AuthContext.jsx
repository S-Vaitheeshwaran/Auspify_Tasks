
import React, {createContext,useContext,useState} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("financeUser");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("financeToken")
  );

  const login = (authData) => {
    sessionStorage.setItem("financeToken", authData.token);

    const userData = {
      userId: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role
    };

    sessionStorage.setItem(
      "financeUser",
      JSON.stringify(userData)
    );

    setToken(authData.token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("financeToken");
    sessionStorage.removeItem("financeUser");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
