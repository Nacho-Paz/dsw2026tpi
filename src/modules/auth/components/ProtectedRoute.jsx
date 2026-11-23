import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';

function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const homeByRole = {
      Administrador: '/admin/home',
      Paciente: '/',
    };

    return <Navigate to={homeByRole[role] || '/login'} replace />;
  }

  return children;
}

export default ProtectedRoute;
