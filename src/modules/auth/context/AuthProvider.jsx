import { createContext, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    return Boolean(token && role);
  });
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  const singout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setRole(null);
  };

  const setAuthSession = (token, userRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    setIsAuthenticated(true);
    setRole(userRole);
  };

  const singinAdmin = async (email, password) => {
    const { data, error } = await loginAdmin(email, password);

    if (error) {
      return { error };
    }

    setAuthSession(data.token, data.role);

    return { error: null };
  };

  const singinPatient = async (email, dni) => {
    const { data, error } = await loginPatient(email, dni);

    if (error) {
      return { error };
    }

    setAuthSession(data.token, data.role);

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        singinAdmin,
        singinPatient,
        singout,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };
