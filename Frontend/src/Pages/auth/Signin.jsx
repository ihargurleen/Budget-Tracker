import React, { useState } from 'react'
import Lottie from 'lottie-react'
import signin from '../../lottie/signin.json'
import axios from "axios"
import apiClient from '../../ApiClient/interceptor'
import { useAuth } from "../../Context/AuthContext.jsx"
const Signin = () => {
    // const LottieComponent = Lottie.default || Lottie

    const {login, setUser} = useAuth()
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    })
    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        })
    }
    const signAxios = async (loginData) => {
        try {
          const response= await login(loginData)
            setUser(response)
        } catch (err) {
            console.log(err.message)
        }
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(loginData);
        signAxios(loginData);
        setLoginData({
            email: "",
            password: "",
        })
    }
    const LottieComponent = Lottie.default || Lottie
    return (
        <>
            <div id='signin'>
                <div>
                    <form onSubmit={handleSubmit} id='form'>
                        <label>Email</label><br />
                        <input type="email" name='email' onChange={handleChange} value={loginData.email} />
                        <br />
                        <label>Password</label><br />
                        <input type="password" name='password' onChange={handleChange} value={loginData.password} />
                        <br /><br />
                        <input type="submit" value="Login" />
                    </form>
                    <div>
                        <div id='lottie-signin'>
                            <LottieComponent animationData={signin} loop={true} />
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Signin