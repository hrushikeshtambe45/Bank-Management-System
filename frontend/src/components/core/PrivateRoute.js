import React from 'react';
import { Navigate } from 'react-router-dom';

// This component protects routes that require a user to be logged in.
function PrivateRoute({ isAuthenticated, children }) {
    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to so we can send them there after they login.
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default PrivateRoute;