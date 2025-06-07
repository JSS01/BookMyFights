import './App.css';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './contexts/UserContext.js'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  const clientID = process.env.REACT_APP_CLIENT_ID;
  
  return (
    
    <BrowserRouter>
      <UserProvider> 
      <GoogleOAuthProvider clientId={clientID}> 
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
