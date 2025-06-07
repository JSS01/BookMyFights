import React from 'react'
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import "../stylesheets/HomePage.css"

const HomePage = () => {
  const navigate = useNavigate()

    const handleLoginSuccess = async (credentialResponse) => {
        // Send credential to backend for verification
        try {
          const res = await axios.post("http://localhost:3001/auth/google", {
            credential: credentialResponse.credential,
          }, { withCredentials: true,})
          console.log("Response is: ", res.data);

          // Save user info to local storage
          localStorage.setItem("user", JSON.stringify(res.data.user));
          // Go to dashboard
          navigate("/dashboard")
          
        } catch (err) { 
          console.log("Error sending credential to backend: ", err);
        }
      }
    
      const handleLoginError = () => {
        console.log("Login Failed");
      };

    
      return (
        <div className="HomePage">
          <h1 className="text-5xl font-bold mb-6 text-center">
            🥊 BookMyFights 🥊
          </h1>
          <p className="text-xl text-gray-300 mb-8 text-center max-w-md">
            Never miss a UFC or boxing match again. Sync all upcoming fights
            directly to your Google Calendar.
          </p>

          <div className='google-login-box'>
            <p> Sign in to your Google Account </p>
            <GoogleLogin width={350} onSuccess={handleLoginSuccess} onError={handleLoginError} />
          </div>
        </div>
      );
}

export default HomePage
