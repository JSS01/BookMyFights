import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/HomePage.css';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';



const HomePage = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events',
    flow: 'implicit', 
    onSuccess: async (tokenResponse) => {
      try {
        await axios.post("http://localhost:3001/auth/google", {
          accessToken: tokenResponse.access_token,
        }, { withCredentials: true });

        // Store token client-side 
        localStorage.setItem("google_access_token", tokenResponse.access_token);
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
         Welcome To BookMyFights 
      </h1>
      <p className="text-xl text-gray-300 mb-8 text-center">
        Never miss your favorite fighters' upcoming UFC or boxing matches again.<br/> Sync their upcoming fights
        directly to your Google Calendar with one click.
      </p>

      <img src="/homePage.png" alt="boxing gloves" height={200}>
      </img>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GoogleIcon />}
          onClick={() => login()}
          sx={{ mt: 3, fontWeight: 'bold', fontSize: '1.1rem' }}
        >
          Sign in with Google
        </Button>

    </div>
  );
};

export default HomePage;