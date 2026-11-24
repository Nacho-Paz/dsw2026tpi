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

  const [patientEmail, setPatientEmail] = useState(() => {
    if (localStorage.getItem('role') !== 'Paciente') return null;

    return sessionStorage.getItem('patientEmail');
  });

  const [adminEmail, setAdminEmail] = useState(() => {
    if (localStorage.getItem('role') !== 'Administrador') return null;

    return sessionStorage.getItem('adminEmail');
  });

  const singout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('patientDni');
    sessionStorage.removeItem('patientEmail'); // <-- Agregar
    sessionStorage.removeItem('adminEmail');
    setIsAuthenticated(false);
    setRole(null);
    setPatientDni(null);
    setPatientEmail(null);
    setAdminEmail(null);
  };

  const setAuthSession = (token, userRole, dni = null, email = null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);

    if (userRole === 'Paciente' && dni) {
      sessionStorage.setItem('patientDni', String(dni));
      setPatientDni(String(dni));
    } else {
      sessionStorage.removeItem('patientDni');
      setPatientDni(null);
    }

    if (userRole === 'Paciente' && email) {
      sessionStorage.setItem('patientEmail', email);
      setPatientEmail(email);
    } else if (userRole === 'Administrador' && email) {
      sessionStorage.setItem('adminEmail', email);
      setAdminEmail(email);
    } else {
      sessionStorage.removeItem('patientEmail');
      sessionStorage.removeItem('adminEmail');
      setPatientEmail(null);
      setAdminEmail(null);
    }

    setIsAuthenticated(true);
    setRole(userRole);
  };

  const singinAdmin = async (email, password) => {
    const { data, error } = await loginAdmin(email, password);

    if (error) {
      return { error };
    }

    setAuthSession(data.token, data.role, null, email);

    return { error: null };
  };

  const singinPatient = async (email, dni) => {
    const { data, error } = await loginPatient(email, dni);

    if (error) {
      return { error };
    }

    // Pasar email como 4to argumento:
    setAuthSession(data.token, data.role, dni, email);

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        patientDni,
        patientEmail, // <-- Exponer aquí
        adminEmail, // <-- Exponer aquí (para DashboardLayout)
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
