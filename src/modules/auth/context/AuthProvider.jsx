import { createContext, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const patientDni = sessionStorage.getItem('patientDni');

    return Boolean(
      token && (role === 'Administrador' || (role === 'Paciente' && patientDni))
    );
  });
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [patientDni, setPatientDni] = useState(() => {
    if (localStorage.getItem('role') !== 'Paciente') return null;

    return sessionStorage.getItem('patientDni');
  });

  const singout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('patientDni');
    setIsAuthenticated(false);
    setRole(null);
    setPatientDni(null);
  };

  const setAuthSession = (token, userRole, dni = null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);

    if (userRole === 'Paciente' && dni) {
      sessionStorage.setItem('patientDni', String(dni));
      setPatientDni(String(dni));
    } else {
      sessionStorage.removeItem('patientDni');
      setPatientDni(null);
    }

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

    setAuthSession(data.token, data.role, dni);

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        patientDni,
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
