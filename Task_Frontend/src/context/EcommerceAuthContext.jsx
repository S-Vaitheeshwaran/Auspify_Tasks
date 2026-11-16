
import React, { createContext, useContext, useState } from "react";

const EcommerceAuthContext = createContext(null);

export const EcommerceAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = sessionStorage.getItem("ecommerceCustomer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("ecommerceToken")
  );

  const [admin, setAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem("ecommerceAdmin");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginCustomer = (authData) => {
    sessionStorage.setItem("ecommerceToken", authData.token);
    sessionStorage.setItem(
      "ecommerceCustomer",
      JSON.stringify(authData.customer)
    );

    sessionStorage.removeItem("ecommerceAdmin");

    setToken(authData.token);
    setCustomer(authData.customer);
    setAdmin(null);
  };

  const loginAdmin = (authData) => {
    sessionStorage.setItem("ecommerceToken", authData.token);
    sessionStorage.setItem(
      "ecommerceAdmin",
      JSON.stringify(authData.admin)
    );

    sessionStorage.removeItem("ecommerceCustomer");

    setToken(authData.token);
    setAdmin(authData.admin);
    setCustomer(null);
  };

  const logout = () => {
    sessionStorage.removeItem("ecommerceToken");
    sessionStorage.removeItem("ecommerceCustomer");
    sessionStorage.removeItem("ecommerceAdmin");

    setToken(null);
    setCustomer(null);
    setAdmin(null);
  };

  return (
    <EcommerceAuthContext.Provider
      value={{
        customer,
        admin,
        token,
        isCustomerAuthenticated: Boolean(token && customer),
        isAdminAuthenticated: Boolean(token && admin),
        loginCustomer,
        loginAdmin,
        logout
      }}
    >
      {children}
    </EcommerceAuthContext.Provider>
  );
};

export const useEcommerceAuth = () => {
  const context = useContext(EcommerceAuthContext);

  if (!context) {
    throw new Error(
      "useEcommerceAuth must be used inside EcommerceAuthProvider"
    );
  }

  return context;
};
