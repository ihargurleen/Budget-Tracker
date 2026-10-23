import { createContext, useContext, useEffect, useState } from "react"
import apiClient from "../ApiClient/interceptor"
//to make this function accessible globally
const AuthContext = createContext(null)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getUser = async () => {
    try {
      const response = await apiClient.get("auth/get-user");
      setUser(response.data.data);
    } catch (err) {
      console.log(err.message)
    }finally{
      setLoading(false)
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  const login = async (LoginData) => {
    try {
      const response = await apiClient.post("/auth/signin", LoginData);
      setUser(response.data.data);
      return response.data.data;
    } catch (err) {
      console.log(err.message)
    }
  };
const signout = async () => {
  try {
    await apiClient.post("/auth/signout");
    setUser(null);
  } catch (err) {
    console.log(err.message);
  }
};


  const value = {
    user, setUser, login,  isAuthenticated : !!user,loading
  };
  return (
    <>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </>
  )
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
}