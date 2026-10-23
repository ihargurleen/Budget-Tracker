import React, { useState } from 'react'
import { Eye , EyeOff } from 'lucide-react';
import Lottie from "lottie-react";
import DancingBear from "../../Lottie/DancingBear.json"
import axios from 'axios';
import apiClient from '../../ApiClient/interceptor';
const Signup = () => {
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: ""
    });
    const [visible,setVisible] = useState(true);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

     const signupAxios= async(loginData) =>{
        try{
            const Response = await apiClient.post("auth/signup",formData,
            );
            console.log(Response, "Test");
        }catch(err){
            console.log(err.message);   
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
      signupAxios(formData);
        setFormData({
            userName: "",
            email: "",
            password: ""
        })
    }
    const LottieComponent = Lottie.default || Lottie;
    return (
        <>
            <div id='signup'>
                <div>
                    <h1>Sign up</h1>
                    <div id='lottie'>
                        <LottieComponent animationData={DancingBear} loop={true}/>
                    </div>
                </div>
                <div>
                    <form onSubmit={handleSubmit} id='form'>
                        <label>UserName</label><br />
                        <input type="text" name='userName' placeholder='Enter UserName' onChange={handleChange} value={formData.userName}/>
                        <br />
                        <label>Email</label><br />
                        <input type="email" name='email' placeholder='Enter Email' onChange={handleChange} value={formData.email}/>
                        <br />
                        <label>Password</label><br />
                        <input type={visible ? "password" : "text"} name='password' placeholder='Enter Password' onChange={handleChange} value={formData.password}/>
                        <div>
                            {visible ? (
                                <Eye onClick={()=>{
                                    setVisible(!visible)
                                }}/>
                            ):(
                                <EyeOff onClick={()=>{
                                    setVisible(!visible)
                                }}/>
                            )}
                        </div>
                        <br /><br />
                        <input type="submit" value="Submit" />
                    </form>
                    {/* <div id='lottie'>
                        <LottieComponent animationData={DancingBear} loop={true}/>
                    </div> */}
                </div>
            </div>
        </>
    )
}

export default Signup;