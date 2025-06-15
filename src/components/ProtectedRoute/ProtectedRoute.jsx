import { Navigate } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({
  component: Component,
  redirectTo,
  ...rest
}) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Component {...rest} /> : <Navigate to={redirectTo} />;
};

// PropTypes validation
ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  redirectTo: PropTypes.string.isRequired,
};

// This component will render a page only if the user is logged in. If the user is not logged in, it will redirect them to the login or welcome page.
