import './App.css';
import Navbar from './components/Navbar.js';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/Homepage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './contexts/UserContext.js'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  const clientID = "805753642950-rookpvnesrtaa0j2ggq3ju1as5khiint.apps.googleusercontent.com"
  
  return (
    
    <BrowserRouter>
      <UserProvider> 
      <GoogleOAuthProvider clientId={clientID}> 
      <Navbar> </Navbar>
      <Routes> 
        <Route path='/' element={<HomePage/>}> </Route>
        <Route path='/dashboard' 
               element={ 
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }> 
        </Route>
      </Routes>
      </GoogleOAuthProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
