import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const login = (newToken) => {
    console.log("Saving token in context:", newToken);
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    console.log("Logging out");
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
