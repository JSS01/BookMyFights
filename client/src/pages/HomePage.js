import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events',
    flow: 'implicit', 
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Token response:", tokenResponse); 
        
        // Send access token to backend
        await axios.post("http://localhost:3001/auth/google", {
          accessToken: tokenResponse.access_token,
        }, { withCredentials: true });

        // Store token client-side 
        // localStorage.setItem("google_access_token", tokenResponse.access_token);

        navigate("/dashboard");
      } catch (err) {
        console.error("Error sending access token to backend:", err);
      }
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  return (
    <div className="HomePage">
      <h1 className="text-5xl font-bold mb-6 text-center">
        🥊 BookMyFights 🥊
      </h1>
      <p className="text-xl text-gray-300 mb-8 text-center max-w-md">
        Never miss a UFC or boxing match again. Sync all upcoming fights
        directly to your Google Calendar.
      </p>

      <div className="google-login-box">
        <p>Sign in to your Google Account</p>
        <button onClick={() => login()} className="google-login-button">
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default HomePage;
