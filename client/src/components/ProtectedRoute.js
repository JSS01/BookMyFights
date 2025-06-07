import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

// Sends user to home page if not authenticated
const ProtectedRoute = ({children}) => {
    const [authenticated, setAuthenticated] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useUser();
  
    useEffect(() => {
      axios
        .get("http://localhost:3001/auth/me", { withCredentials: true })
        .then((res) => {
          if (res.data.authenticated) {
            setAuthenticated(true);
            setUser(res.data.user);            
          } else {            
            navigate("/");
          }
        })
        .catch(() => navigate("/"))
    }, [navigate, setUser]);
    
    return authenticated ? children : null;
  };

export default ProtectedRoute
