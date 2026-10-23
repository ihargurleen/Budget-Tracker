import React from 'react'
import { useAuth } from '../Context/AuthContext';
import { Outlet } from 'react-router-dom';
import { Navigate  } from 'react-router-dom';

const ProtectedRoute = () => {
    const {isAuthenticated,loading}=useAuth();
    if(loading){
      return<>
      <div>
        <h1>loading...</h1>
      </div>
      </>
    }
    if(!isAuthenticated){
        return <Navigate to="/signin" replace={true} />
    }
  return <Outlet />
}

export default ProtectedRoute