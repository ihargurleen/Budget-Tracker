import React, { useEffect } from 'react'
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../ApiClient/interceptor';

const Signout = () => {
    const {setUser} = useAuth();
    const navigate = useNavigate();
    const logout = async()=>{
        try{
            await apiClient.post("/auth/signout");
            setUser(null);
            navigate("/signin");
        }catch(err){
            console.log(err.message)
        }
    }
    useEffect(() =>{
        logout();
    })
  return (
   <></>
  )
}

export default Signout