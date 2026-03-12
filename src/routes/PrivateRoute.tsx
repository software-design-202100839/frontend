import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

function PrivateRoute({ children, roles }: PrivateRouteProps) {
  if (!authService.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const user = authService.getStoredUser();
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default PrivateRoute;
